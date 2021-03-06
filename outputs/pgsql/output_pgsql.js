var base_output = require('@pastash/pastash').base_output,
    logger = require('@pastash/pastash').logger,
    util = require('util');
var THIS ;
var pg = require('pg');

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}


function OutputPostgres() {
    base_output.BaseOutput.call(this);
    this.mergeConfig({
        name: 'postgres',
        optional_params: ['db', 'table', 'query', 'host', 'user', 'password', 'port', 'create_table', 'id'],
        default_values: {
            'db' : 'test',
            'table' : 'pastash',
            'host': '127.0.0.1',
            'port': 5432,
            'user': 'root',
            'password': 'admin',
            'id': 'id',
	    'create_table': false
        },
        start_hook: this.start,
    });
}
OutputPostgres.prototype.start =function(callback) {
    THIS =  this;
    if (this.db) {
        try {
	    var pgConnectionString = 'postgres://' + this.username + ':' + this.password + '@' + this.host + ":" + this.port + '/' + this.db;
            logger.info('Initializing Outpu Postgres:',this.db);
		pg.connect(pgConnectionString, function(err, client, done) {
        	  if(err) {
       		     return console.error('error fetching client from pool', err);
       		  }
		  this.client = client;
		  this.done = done;
		  if (this.create_table){
			this.client.query('CREATE TABLE IF NOT EXISTS ' + this.table + '(id TEXT NOT NULL PRIMARY KEY, data JSONB NOT NULL);',
		                function(err,result) {
		                    done();
		                    if (err) {
		                        logger.error("error creating table!", err);
		                    }
				    if (this.debug) logger.info(result);
				}
		        );
		  }
	        });
        } catch(e){ logger.error('Failed Initializing Filter Postgres',e); }
    }
    logger.info('Initialized Filter Postgres');
    callback();
}

util.inherits(OutputPostgres, base_output.BaseOutput);

OutputPostgres.prototype.process = function(data) {
	var id = uuidv4();
	if (data[this.id]) id = data[this.id];
	this.client.query('insert into ' + this.table + '(id, data) values($1, $2)',
                [id, data],
                function(err,result) {
                    if (err) {
                        logger.error("error inserting!", this.table, err);
                    }
		    if (this.debug) logger.info(result);
		}
        );
};

OutputPostgres.prototype.close = function(callback) {
    logger.info('Closing postgres');
    this.done();
    callback();
};

exports.create = function() {
    return new OutputPostgres();
};
