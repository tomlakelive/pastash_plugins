Postgres output plugin
---

Status : core plugin, unit tested and maintained.

This plugin is used insert JSONB data into Postgres.

### Config using logstash format:
````
output {
  if [type] == nginx {
    pgsql {
      database => mydatabase
      table => test
      host => localhost
      port => 5432
    }
  }
}
````

Parameters:

* ``database``: name of the postgres database.
* ``table``: name of the postgres table.
* ``host``: ip of the influxdb server.
* ``port``: port of the influxdb server.
* ``id``: JSON object to be used as identifier of inserts. Autogenerated if missing.

