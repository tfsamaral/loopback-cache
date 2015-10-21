var should = require('./init.js');
var mixin = require('../mixins/cacheModel');
var DataSource = require('loopback-datasource-juggler').DataSource;
var db;
var Person;
var options;

describe('json-parsing', function() {

  before(function() {
    db = getDataSource();
    Person = db.createModel('person', {id: Number, name: String, age: Number});
    persons = [
      {
        id: 1,
        name: 'Mary',
        age: 34
      },
      {
        id: 2,
        name: 'Charlie',
        age: 24
      }
    ];
    options = {
      backend: 'redis',
      ttl: 3  //seconds
    };
  });

  it('create should create new item', function(done) {
    return Person.create(persons[0]).then(function(res) {
      res.name.should.eql('Mary');
      done();
    }).catch(function(err) {
      done(err);
    });
  });

  it('create should create new item with mixin EXPIRE in 3s', function(done) {
    mixin(Person, options);
    return Person.create(persons[1]).then(function(res) {
      res.name.should.eql('Charlie');
      setTimeout(function() {
        return Person.findById('3').then(function(res) {
          should.not.exist(res.id);
          done();
        }).catch(function(err) {
          done(err);
        });
      }, options.ttl * 1000);
    }).catch(function(err) {
      done(err);
    });
  });

  it('create error with none-redis connector', function(done) {
    db = new DataSource('memory');
    Person = db.createModel('person', {id: Number, name: String, age: Number});
    mixin(Person, options);
    return Person.create(persons[1]).then(function(res) {
      done(new Error('expected an error'));
    }).catch(function(err) {
      should.exist(err);
      done();
    });
  });

});