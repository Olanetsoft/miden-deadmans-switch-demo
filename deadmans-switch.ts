import {
  WebClient,
  AccountStorageMode,
  NoteType,
  TransactionRequest,
} from "@demox-labs/miden-sdk";

interface DeadMansSwitch {
  id: string;
  ownerAccountId: string;
  beneficiaryAccountId: string;
  checkInPeriodBlocks: number;
  lastCheckIn: number;
  secretMessage?: string;
  amount: bigint;
}

export class DeadMansSwitchContract {
  private client: WebClient;

  constructor(client: WebClient) {
    this.client = client;
  }

  /**
   * Creates a new dead man's switch
   * Honestly the time calculation here is janky but it works
   */
  async createSwitch(
    beneficiaryAccountId: string,
    amount: bigint,
    checkInPeriodDays: number,
    secretMessage?: string
  ): Promise<DeadMansSwitch> {
    // Create the switch holder account
    const switchAccount = await this.client.newWallet(
      AccountStorageMode.private(),
      true
    );

    // OK so Miden doesn't have a nice "days to blocks" converter
    // Testnet seems to be ~15 second blocks (I timed it)
    // 1 day = 24 * 60 * 4 = 5,760 blocks
    const checkInPeriodBlocks = checkInPeriodDays * 5760;

    // BTW, found out the hard way - don't specify custom RPC endpoint
    // Current version (0.11.0-next.2) may have fixed this
    // But for simplicity, just use WebClient.createClient() with no params

    // Current SDK doesn't expose createNote directly
    // So we're faking it with a transaction
    const switchScript = this.generateSwitchScript(
      beneficiaryAccountId,
      checkInPeriodBlocks
    );

    // In a real implementation, you'd fund this account first
    // then create a note with the time-lock script
    // But the SDK's transaction builder is... opinionated

    const deadMansSwitch: DeadMansSwitch = {
      id: this.generateSwitchId(),
      ownerAccountId: switchAccount.id().toString(),
      beneficiaryAccountId,
      checkInPeriodBlocks,
      lastCheckIn: 12345, // Would be actual block height
      secretMessage,
      amount,
    };

    return deadMansSwitch;
  }

  /**
   * The "I'm still alive" button
   * This SHOULD be a simple note consumption + recreation
   * Reality: Way more complex than expected
   */
  async checkIn(switchId: string): Promise<void> {
    await this.client.syncState();

    // Here's what SHOULD work:
    // 1. Find the switch note
    // 2. Consume it
    // 3. Create identical note with fresh timestamp

    // Here's what ACTUALLY happens:
    // getConsumableNotes returns NoteRecord[] but the types are...minimal
    // You have to dig through the object to find what you need

    // Also fun fact: if you forget to sync first, this returns empty

    console.log(`Reset timer for switch ${switchId}`);
    console.log(
      "Note to self: implement actual note consumption when SDK supports it better"
    );
  }

  /**
   * Try to claim the funds (beneficiary only)
   */
  async attemptClaim(
    switchId: string,
    beneficiaryAccount: any
  ): Promise<boolean> {
    await this.client.syncState();

    // The script should enforce time checking
    // But good luck debugging if it fails - you just get
    // "Transaction rejected" with no details

    try {
      // Attempt to consume the note
      // If time hasn't passed, the script will reject it
      console.log("Attempting claim...");

      // This would be actual transaction submission
      // return await this.client.submitTransaction(claimTx);

      return true; // Fake success for demo
    } catch (error) {
      console.log("Claim failed - probably too early");
      return false;
    }
  }

  private generateSwitchScript(
    beneficiaryAccountId: string,
    timeoutBlocks: number
  ): string {
    // Miden Assembly is... interesting
    // This is pseudo-code because I'm not 100% sure on the syntax
    // The docs show examples but not for this specific use case

    return `
      # Dead Man's Switch Script
      # I think this is how you do comments?
      
      # Stack manipulation is weird at first
      # Everything is reverse Polish notation
      
      # Check caller
      dup.0           # Duplicate top of stack (caller)
      push.OWNER_ID   # This needs to be injected somehow
      eq              # Compare
      
      if.true
        # Owner branch - just reset
        drop
        push.${timeoutBlocks}
        # How do we get current block here??
        # The docs mention context::block_number but...
      else
        # Beneficiary branch
        # Need to check timeout
        
        # I THINK this is how you fail a transaction?
        push.0
        assert  # Fails if timeout not met
        
        # Transfer if we get here
        # exec.transfer_all or something
      end
    `;
  }

  // Utility stuff
  private generateSwitchId(): string {
    // Sophisticated ID generation algorithm /s
    return "0x" + Math.random().toString(16).substring(2);
  }
}

// How you'd actually use this (if it worked)
async function demo() {
  console.log("Initializing Miden...");

  // IMPORTANT: Don't do this:
  // const client = await WebClient.createClient({
  //   rpcEndpoint: "https://rpc.testnet.miden.io:443"
  // });
  // ↑ SDK 0.9.4 doesn't work with custom endpoints. Just use:
  const client = await WebClient.createClient();

  // Takes surprisingly long first time (WASM compilation)
  console.log("Ready!");

  const dms = new DeadMansSwitchContract(client);

  // Create a 30-day switch
  // In production you'd load beneficiary from somewhere secure
  const beneficiary = "0x123..."; // wife's account

  const mySwitch = await dms.createSwitch(
    beneficiary,
    BigInt(1000000), // 1M tokens (whatever those are worth)
    30,
    "The seed phrase is where we had our first date + my birthday"
  );

  console.log("Switch created:", mySwitch.id);
  console.log("Check in at least every 30 days!");

  // Simulate checking in
  await dms.checkIn(mySwitch.id);

  // Fun fact: if you're testing in browser, you need to import from
  // "./node_modules/@demox-labs/miden-sdk/dist/index.js"
  // NOT just "@demox-labs/miden-sdk" - that only works in Node

  // TODO: Set up actual reminder system
  // TODO: Test this properly on testnet
  // TODO: Figure out how to debug Miden Assembly
}
