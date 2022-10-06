curl -X POST http://sp1.test/api1/refresh_token \
   -H 'Content-Type: application/json' \
   -H 'Authorization: Bearer '$1 \
   -d '{"refresh_token":"'$2'"}'