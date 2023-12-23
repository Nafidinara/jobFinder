# JobFinder - Find your best job around the world

## Overview

This smart contract implements a job finder system using the typescript on azle for internet Computer. This system
allows us to create an account, then post a job to the entire network. In addition, users can manage posted jobs such as
editing, viewing the number of applications, and deleting jobs.

## Prerequisites

- Node
- Typescript
- DFX
- IC CDK
- Azle `^0.18.6`

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/Nafidinara/jobFinder.git
    cd jobFinder
    ```
2. **Install requirements:**

    ```bash
    npm install
    ```
2. **Running Program:**

    ```bash
    dfx start --background --clean
    npx azle clean
    dfx deploy
    ```

## Project Structure

The project is organized into the following directories and files:

- **`src/`**: Contains the source code for the job finder system.
    - **`index.ts`**: App entry point Implementation of the job finder system.
    - **`types.ts`**: File contain data types of the job finder system.

- **`node_modules/`**: Directory for project dependencies.

- **`package.json`**: Configuration file for npm, including project dependencies and scripts.

- **`tsconfig.json`**: TypeScript configuration file, specifying compiler options.

- **`LICENSE`**: MIT License file, detailing the terms under which the project is licensed.

- **`README.md`**: Project documentation providing an overview, installation instructions, usage details, and license
  information.

## Functions

## Usage

## Try it out

`dfx` is the tool you will use to interact with the IC locally and on mainnet. If you don't already have it installed:

```bash
npm run dfx_install
```

Next you will want to start a replica, which is a local instance of the IC that you can deploy your canisters to:

```bash
npm run replica_start
```

If you ever want to stop the replica:

```bash
npm run replica_stop
```

Now you can deploy your canister locally:

```bash
npm install
npm run canister_deploy_local
```

To call the methods on your canister:

```bash
npm run name_of_function
npm run name_of_function
```

Assuming you
have [created a cycles wallet](https://internetcomputer.org/docs/current/developer-docs/quickstart/network-quickstart)
and funded it with cycles, you can deploy to mainnet like this:

```bash
npm run canister_deploy_mainnet
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
