#AWS SSM

## Installation

```
npm i -g aws-ssm-tools
```

Given you are logged into an AWS account (take a look at [awsp](https://github.com/danielwalker/aws-profile-prompt)) 
these commands will allow you to manage SSM Parameters in bulk. 

To read all Parameters.

```
aws-ssm-read  
```

To write Parameters from one account to another

```

# Dump the Parameters from one Account.
aws-ssm-read > env.json

# Switch into the taget AWS Account.
awsp

# Write the Parameters to the new Account (-o will overwrite Parameters). 
aws-ssm-write -f env.json -o
```

Full help can be found using:

```
aws-ssm-read --help
aws-ssm-write --help
```
