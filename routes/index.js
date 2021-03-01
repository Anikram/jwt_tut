const jwt = require('json-web-token');

let users = {
  john: {password: "passwordjohn"},
  mary: {password:"passwordmary"}
}

exports.login = function(req, res){

  let username = req.body.username
  let password = req.body.password

  // Neither do this!
  if (!username || !password || users[username] !== password){
    return res.status(401).send()
  }

  let payload = {username: username}

  //create the access token with the shorter lifespan
  let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    algorithm: "HS256",
    expiresIn: process.env.ACCESS_TOKEN_LIFE
  })

  //create the refresh token with the longer lifespan
  let refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    algorithm: "HS256",
    expiresIn: process.env.REFRESH_TOKEN_LIFE
  })

  //store the refresh token in the user array
  users[username].refreshToken = refreshToken

  //send the access token to the client inside a cookie
  res.cookie("jwt", accessToken, {secure: true, httpOnly: true})
  res.send()
}

exports.refresh = function (req, res){

  let accessToken = req.cookies.jwt

  if (!accessToken){
    return res.status(403).send()
  }

  let payload
  try{
    payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
  }
  catch(e){
    return res.status(401).send()
  }

  //retrieve the refresh token from the users array
  let refreshToken = users[payload.username].refreshToken

  //verify the refresh token
  try{
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
  }
  catch(e){
    return res.status(401).send()
  }

  let newToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET,
    {
      algorithm: "HS256",
      expiresIn: process.env.ACCESS_TOKEN_LIFE
    })

  res.cookie("jwt", newToken, {secure: true, httpOnly: true})
  res.send()
}