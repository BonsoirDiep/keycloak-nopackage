curl -X POST http://127.0.0.2:3000/json \
   -H 'Content-Type: application/json' \
   -d '{"login":"my_login","password":"'$1'"}'