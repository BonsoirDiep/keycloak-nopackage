export access_token=$1
# echo "First arg: $1"
curl -v -X GET \
   http://api.sp1.test/api1/test \
   -H "Authorization: Bearer "$access_token