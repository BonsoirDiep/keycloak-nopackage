export access_token=$1
# echo "First arg: $1"
curl -v -X GET \
   http://127.0.0.2:3000/api1/test \
   -H "Authorization: Bearer "$access_token