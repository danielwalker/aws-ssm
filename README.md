# AWS SSM

Tools for reading and writing SSM Parameters in bulk.

## Installation

```
npm i -g aws-ssm-tools
```

Given you are logged into an AWS account (take a look at [awsp](https://github.com/danielwalker/aws-profile-prompt)) 
these commands will allow you to manage SSM Parameters in bulk. 

To read all Parameters:

```
aws-ssm-read  
```

To write Parameters from one account to another:

```
# Dump the Parameters from one Account.
aws-ssm-read > env.json

# Switch into the taget AWS Account.
awsp

# Write the Parameters to the new Account (-o will overwrite Parameters). 
aws-ssm-write -f env.json -o
```

You can also use this tool to create .env files given an SSM Path. For example, the following will create a .env.dev 
file based on the SSM Parameters in the Development AWS Account.

```
# Switch into the Development AWS Account.
awsp

# Dump the Parameters to .env.dev
aws-ssm-read -p /project/app -e > .env.dev
```

To write a local `.env.dev` file to SSM under a path (all these will be written as an SSM String Type Parameters):

```
aws-ssm-write -p /project/app -e -f .env.dev
```

Full help can be found using:

```
aws-ssm-read --help
aws-ssm-write --help
```
