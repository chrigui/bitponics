var should = require('should');

module.exports = {
  sharedTests : {
    remove : function(model, instanceCreationFunction){
      describe('.remove', function(){
        it('removed the specified docs from the collection and inserts them into the removedDocuments collection', function(done){
          var RemovedDocumentModel = require('../../models/removedDocument').model;

          instanceCreationFunction(function(err, instance){
            should.not.exist(err);
            should.exist(instance, "instance should exist");

            model.remove({ "_id" : instance._id}, function(err){
              should.not.exist(err);

              RemovedDocumentModel.findOne({
                collectionName : model.collection.name,
                documentId : instance._id
              }).exec(function(err, removedDocument){
                should.not.exist(err);
                should.exist(removedDocument, "removedDocument should exist");

                removedDocument.collectionName.should.equal(model.collection.name);
                should.exist(removedDocument.documentObject, "documentObject should exist");

                return done();
              });
            });
          });
        });
      });
    }
  },
  createSensorLog : function(options, callback) {
    var ModelUtils = require('../../models/utils');
    
    ModelUtils.logSensorLog(
    {
      pendingSensorLog : {
        gpi : self.gpi,
        logs : [
          {
            sCode : 'ph',
            val: 4.4
          }
        ]
      },
      user : self.mocks.user
    },
    function(err){
      return done();
    });
  }
};
