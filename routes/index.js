var express = require('express');
const SSOVinorSoft = require('./lib');
var router = express.Router();

const clientId= process.argv[2]? 'keycloak-express-2': 'keycloak-express';
const callbackUrl= `http://${process.argv[2]? '127.0.0.1:'+ process.argv[2]: '127.0.0.2:3000'}/login?auth_callback=1`

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express',
    clientId: clientId,
    callbackUrl: callbackUrl
  });
});

router.get('/logout', function (req, res, next) {
  res.render('logout', {
    title: 'Logout',
    clientId: clientId,
    callbackUrl: callbackUrl
  });
});

router.post('/json', function (req, res) {
  console.log(req.body);
  res.json({ heelo: 'U' });
})

var ssoBackend = new SSOVinorSoft({
  realmUrl: 'https://demo1.nodejsauto.com/realms/keycloak-express',
  clientId: clientId,
  secret: process.argv[2]? 'y589uCbYnTU4Tj5PPOjvUoHi7nacv8MS': 'ASKLU56S3t95HLsNxw8X4F10M7isX8DC',
  callbackUrl: callbackUrl,
  publicKey: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3bYz2B7BCZRr8leZZaEztnXL8yud7i414XrKD7ehxJVwYiNaQhkyj7L0MwWeCnchCpPpzJRn9C/yeQmX+rQlZtFataoEgrBUyCqTo8ord8O+CMh8xhibDMih8Enzt2pu0aazBNdW1+iAQ/kWAZas7khDf9fQ84Q3JyLyy4W9+xyKEIOaglIy34jHPaImOPvr6lMmU2gtlzOYG/hXCQCdgIsTdpODMuJYfr3GqJNAuGmB1DnEm3rkWXt9eBMfEIFapryIkiJoYnOreRvpTfZvjGauMOLjMT98grxUPUXJdRO+owo2AQKE6sEZtny6sQvCyqEeLH2OC9yZ4yt4Fo8nkQIDAQAB"
});

router.get('/login', function (req, res, next) {
  // res.render('index', { title: 'Express' });

  const loginPath= process.argv[2]? '/sso2.html': '/sso.html';

  const auth_code = req.query['code'];
  if (!auth_code) {
    res.headersSent ? '' : res.setHeader('Cache-Control', 'public, max-age=0');
    res.redirect(302,  loginPath);
    return;
  }
  // console.log({ auth_code });
  ssoBackend.obtainFromCode(auth_code, function (err, data) {
    if (err) {
      console.log(err);
      res.headersSent ? '' : res.setHeader('Cache-Control', 'public, max-age=0');
      res.redirect(302, loginPath);
      return;
    }
    // console.log(data);
    // res.json(data);
    res.render('index', {
      title: 'Token Here',
      clientId: clientId,
      callbackUrl: callbackUrl,
      data
    });
  });
});

router.all('/api1/*', function (req, res, next) {
  var a = req.header('authorization') || '';
  a = a.split('Bearer ')[1] || '';
  if (!a) {
    res.sendStatus(403);
    return;
  }

  // var isExpired = ssoBackend.isExpired(a);
  // if (isExpired) {
  //   res.sendStatus(403);
  //   return;
  // }


  ssoBackend.userInforFromServer(a, function(err,data){
    console.log(err, data);
  })

  var x1 = ssoBackend.userInfor(a);

  if (x1.expired) {
    res.sendStatus(403);
    return;
  }

  req.access_token = a;
  req.sso_sid = x1.sid;
  console.log('session_state:', x1.sid);
  next();
});

router.get('/api1/test', function (req, res, next) {
  var x1 = ssoBackend.userInfor(req.access_token);
  res.json(x1);
});

router.post('/api1/refresh_token', function (req, res, next) {
  var refreshToken = req.body.refresh_token;
  if (!refreshToken) {
    res.sendStatus(403);
    return;
  }

  ssoBackend.refreshToken(refreshToken, req.sso_sid, function (err, data) {
    if (err) {
      res.sendStatus(403);
      return;
    }
    res.json(data);
  })
});




module.exports = router;
