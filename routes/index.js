var express = require('express');
const SSOVinorSoft = require('./lib');
var router = express.Router();

const clientId = process.argv[2] ? 'express-2' : 'express-1';
const realmUrl = 'http://117.4.247.68:10825/realms/DemoRealm';

var ssoBackend;
router.use(function (req, res, next) {
  if(!ssoBackend) ssoBackend = new SSOVinorSoft({
    realmUrl,
    clientId: clientId,
    secret: process.argv[2] ? '1kS2tB34G86kzVADWfiwyONUw4OIIvqU' : 'Ih1aaQ6Jv1EFagzZjCRT8KIT2Nl9NovB',
    callbackUrl: req.callbackUrl,
    publicKey: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAl44n+kHYSyKY6LR+1t3QYhfVI6yobWi8sTSKMP9q3RZDHjkQNs8BMIx3MIOrx3h4yg6ony6TsVzt6BbKK6GP/Bz8fqh0nhlI90aGfd+06arMXcg2vnSMIoxns8rnC20vN/vpdOKCM5u4QLwBQMcQbA7Y7n0KBEHPhB+i1+nP9tWILihLVEQ9cpuHj+qCGqBq1E+CZV4hb8tyYMKuAxKzA/EF4O6ABpt1r6pP56CDRTUBzzzxrqDkssZ/abqbjkSngEbEixuvtgDu6WAuMlq0QlvoM24s117Cu24PC6hrGgXB/n7IkeDMtNaR8iselHsk1L3YY9DLijR16c+9J3g/NwIDAQAB"
  });
  return next();
})

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express',
    clientId: clientId,
    callbackUrl: req.callbackUrl,
    logOutUrl: req.logOutUrl,
    realmUrl
  });
});

router.get('/logout', function (req, res, next) {
  res.render('logout', {
    title: 'Logout',
    clientId: clientId,
    callbackUrl: req.callbackUrl,
    realmUrl
  });
});

router.post('/json', function (req, res) {
  console.log(req.body);
  res.json({ heelo: 'U' });
});

router.get('/login', function (req, res, next) {

  const loginPath = '/';

  const auth_code = req.query['code'];
  if (!auth_code) {
    res.headersSent ? '' : res.setHeader('Cache-Control', 'public, max-age=0');
    res.redirect(302, loginPath);
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
      callbackUrl: req.callbackUrl,
      data,
      logOutUrl: req.logOutUrl,
      realmUrl
    });
  });
});

router.post('/api1/refresh_token', function (req, res, next) {
  var refreshToken = req.body.refresh_token;
  if (!refreshToken) {
    res.sendStatus(403);
    return;
  }

  ssoBackend.refreshToken(refreshToken, req.sso_sid, function (err, data) {
    if (err) {
      console.error(err);
      res.sendStatus(403);
      return;
    }
    res.json(data);
  })
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


  ssoBackend.userInforFromServer(a, function (err, data) {
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




module.exports = router;
