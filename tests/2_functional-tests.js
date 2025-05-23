const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  const project = 'test-project';
  let issueId1; // Pour stocker l'ID d'une issue créée
  let issueId2;

  // 1. Create an issue with every field
  test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/' + project)
      .send({
        issue_title: 'Title 1',
        issue_text: 'Text 1',
        created_by: 'Functional Test - Every Field',
        assigned_to: 'Chai and Mocha',
        status_text: 'In QA'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.equal(res.body.issue_title, 'Title 1');
        assert.equal(res.body.assigned_to, 'Chai and Mocha');
        issueId1 = res.body._id;
        done();
      });
  });

  // 2. Create an issue with only required fields
  test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/' + project)
      .send({
        issue_title: 'Title 2',
        issue_text: 'Text 2',
        created_by: 'Functional Test - Required Fields'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.equal(res.body.issue_title, 'Title 2');
        assert.equal(res.body.assigned_to, '');  // default empty
        issueId2 = res.body._id;
        done();
      });
  });

  // 3. Create an issue with missing required fields
  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/' + project)
      .send({
        issue_title: 'Missing fields test'
        // missing issue_text and created_by
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  // 4. View issues on a project (no filter)
  test('View issues on a project: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/' + project)
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.property(res.body[0], 'issue_title');
        done();
      });
  });

  // 5. View issues on a project with one filter
  test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/' + project)
      .query({ open: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.isTrue(issue.open);
        });
        done();
      });
  });

  // 6. View issues on a project with multiple filters
  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/' + project)
      .query({ open: true, assigned_to: 'Chai and Mocha' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.isTrue(issue.open);
          assert.equal(issue.assigned_to, 'Chai and Mocha');
        });
        done();
      });
  });

  // 7. Update one field on an issue
  test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/' + project)
      .send({
        _id: issueId1,
        issue_text: 'Updated text'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, issueId1);
        done();
      });
  });

  // 8. Update multiple fields on an issue
  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/' + project)
      .send({
        _id: issueId1,
        issue_text: 'Multi updated text',
        issue_title: 'Multi updated title',
        open: false
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, issueId1);
        done();
      });
  });

  // 9. Update an issue with missing _id
  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/' + project)
      .send({
        issue_text: 'Trying to update without _id'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  // 10. Update an issue with no fields to update
  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/' + project)
      .send({
        _id: issueId1
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'no update field(s) sent');
        assert.equal(res.body._id, issueId1);
        done();
      });
  });

  // 11. Update an issue with an invalid _id
  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/' + project)
      .send({
        _id: '123invalidid',
        issue_text: 'Trying update invalid id'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not update');
        assert.equal(res.body._id, '123invalidid');
        done();
      });
  });

  // 12. Delete an issue
  test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/' + project)
      .send({
        _id: issueId2
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully deleted');
        assert.equal(res.body._id, issueId2);
        done();
      });
  });

  // 13. Delete an issue with an invalid _id
  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/' + project)
      .send({
        _id: 'invalidid123'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not delete');
        assert.equal(res.body._id, 'invalidid123');
        done();
      });
  });

  // 14. Delete an issue with missing _id
  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/' + project)
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

});
