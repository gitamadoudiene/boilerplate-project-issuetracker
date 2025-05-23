'use strict';

const { v4: uuidv4 } = require('uuid');

let issues = {}; // stock en mémoire pour l’exemple (clé = project)

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get((req, res) => {
      let project = req.params.project;
      if (!issues[project]) issues[project] = [];
      let filtered = issues[project];

      // Filtrer si des query params sont passés
      const filters = req.query;
      Object.keys(filters).forEach(key => {
        filtered = filtered.filter(issue => issue[key] == filters[key]);
      });

      res.json(filtered);
    })
    
    .post((req, res) => {
      let project = req.params.project;
      if (!issues[project]) issues[project] = [];

      const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      let newIssue = {
        _id: uuidv4(),
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open: true,
        created_on: new Date(),
        updated_on: new Date()
      };

      issues[project].push(newIssue);
      res.json(newIssue);
    })
    
    .put((req, res) => {
      let project = req.params.project;
      let body = req.body;

      if (!body._id) {
        return res.json({ error: 'missing _id' });
      }
      if (!issues[project]) issues[project] = [];
      let issue = issues[project].find(i => i._id === body._id);
      if (!issue) {
        return res.json({ error: 'could not update', _id: body._id });
      }

      // Si aucune propriété à mettre à jour
      let hasUpdates = false;
      ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open'].forEach(field => {
        if (body[field] !== undefined && body[field] !== '') {
          issue[field] = body[field];
          hasUpdates = true;
        }
      });

      if (!hasUpdates) {
        return res.json({ error: 'no update field(s) sent', _id: body._id });
      }

      issue.updated_on = new Date();
      res.json({ result: 'successfully updated', _id: body._id });
    })
    
    .delete((req, res) => {
      let project = req.params.project;
      let body = req.body;

      if (!body._id) {
        return res.json({ error: 'missing _id' });
      }

      if (!issues[project]) issues[project] = [];

      const index = issues[project].findIndex(i => i._id === body._id);

      if (index === -1) {
        return res.json({ error: 'could not delete', _id: body._id });
      }

      issues[project].splice(index, 1);

      res.json({ result: 'successfully deleted', _id: body._id });
    });
    
};
