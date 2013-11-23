var should = require('should');

module.exports = {
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
}
