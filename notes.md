VIEWS:

  "one" - shows full details of one particular snippet

  "many" - shows description of many snippets

  "edit" - Editor for a snippet (has a cancel/delete button)

  "create" - Creator. Has a cancel button.

  "login" - login screen

  "logout" - logout screen

  "register" - register a new user



ENDPOINTS:

See all Snippets:
  /snippets/
  uses "many" view

See list of all Users:
  /users/
  uses "users" view



Create a snippet
  /create/
  uses "create" view

Edit a snippet
  /edit/:id
  uses "edit" view

An Individual Snippet:
  /snippets/id/:id
  uses "one" view

View all snippets with a certain tag
  /snippets/tag/:tag
  uses "many" view

See all snippets by a certain user
  /snippets/user/:username/
  uses "many" view

See all snippets for a certain language
  /snippets/language/:language/

Default behavior ('/')
If logged in, go straight to /snippets/
otherwise, go to /login/


NOTES:
to import sample data from json:
mongoimport --db snippetdb --collection snippets --drop --jsonArray --file sample-snippets.json

TODOS:
- use PUT instead of POST for update
- delimit tags by ALL whitespace, not just a single space

REQS:
- allow you to create a snippet
- allow you to see a list of all your snippets for a specific language

DONE:
- have registration and login
- allow you to see a list of all your snippets
- allow you to see a list of all your snippets for a specific tag
- allow you to look at an individual snippet


CANCELED
- have a comprehensive set of tests for all controllers and models
- have an API to allow for creating and viewing of snippets as listed above
