const winston = require('winston');
const appRoot = require('app-root-path');
const Log2gelf = require('winston-log2gelf');

var options = {
    file: {
        level: process.env.FILE_LOGLEVEL,
        filename: `${appRoot}/logs/app.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: process.env.FILE_LOGMAXFILES,
        colorize: false,
    },
    console: {
        level: process.env.CONSOLE_LOGLEVEL,
        handleExceptions: true,
        json: false,
        colorize: true,
    },
    gelfPro: {
        level: process.env.GELFPRO_LOGLEVEL,
        host: process.env.GELFPRO_IP,
        port: process.env.GELFPRO_PORT,
        protocol: process.env.GELFPRO_PROTOCOL
      }    
};

var logger = winston.createLogger({
    transports: [
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console),
        new Log2gelf(options.gelfPro)
    ],
    exitOnError: false, // do not exit on handled exceptions
});

logger.stream = {
    write: function (message, encoding) {
        logger.info(message);
    },
};


module.exports = logger;