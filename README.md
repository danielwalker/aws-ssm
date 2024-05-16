#AWS SSM

Given you are logged into an AWS account (take a look at [awsp](https://github.com/danielwalker/aws-profile-prompt)) 
these commands will allow you to manage SSM Parameters in bulk. 

To read all Parameters into a local Properties File.

```
aws-ssm-read -f env.properties 
```

To write Parameters from a local Properties File to the SSM Parameter Store.

```
aws-ssm-write -f env.properties
```


To read Parameters from an SSM Parameter Store Path to a .env file (without the SSM Parameter Store Path).

```
aws-ssm-read -f .env  -p /app/cloud -s
```

Full help can be found using:

```
aws-ssm-read --help
aws-ssm-write --help
```
