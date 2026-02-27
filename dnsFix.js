const dns = require("node:dns/promises");

dns.setServers(["8.8.8.8", "8.8.4.4"]);
