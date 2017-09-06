VIEWS:

  "one" - shows full details of one particular snippet

  "many" - shows description of many snippets

  "edit" - Editor for a snippet (doubles as a creator, also has a delete and cancel button)

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

An Individual Snippet:
  /snippets/id/:id
  uses "one" view

Create a snippet
  /edit/
  uses "edit" view

Edit a snippet
  /edit/:id
  uses "edit" view

View all snippets with a certain tag
  /snippets/tag/:tag
  uses "many" view


See all snippets by a certain user
  /users/:username/
  uses "many" view

Default behavior ('/')
If logged in, go straight to /snippets/
otherwise, go to /login/


TODOS:
