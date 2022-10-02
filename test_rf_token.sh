curl -X POST http://127.0.0.2:3000/api1/refresh_token \
   -H 'Content-Type: application/json' \
   -H 'Authorization: Bearer '$1 \
   -d '{"refresh_token":"'$2'"}'