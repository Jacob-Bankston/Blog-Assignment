// Ability to delete a post
// Ability to update a post
// Ability to view all posts

// !Ability to add user accounts
// !Ability to allow login
// !Ability to associate users with their own content

const express = require('express')
const mustacheExpress = require('mustache-express')
const app = express()
const PORT = 3000
const path = require('path')

app.use(express.json())
app.use(express.urlencoded())
app.use(express.static('styles'))
app.use(express.static('js'))

const VIEWS_PATH = path.join(__dirname,'/views')

app.engine('mustache', mustacheExpress(VIEWS_PATH + '/partials', '.mustache'))
app.set('views', VIEWS_PATH)
app.set('view engine', 'mustache')

var pgp = require('pg-promise')();
var connectionString = 'postgres://localhost:5432/blogassignment';
var db = pgp(connectionString);

app.get('/', async (req, res) => {
    db.any('SELECT postid, title, content FROM posts ORDER BY postid DESC;').then(posts => {
        res.render('index', {posts: posts})
    }).catch(error => {
        res.render('/', {message: 'Unable to get posts!'})
    })
})

app.post('/update-post', (req,res) => {
    let title = req.body.title
    let content = req.body.content
    let postid = req.body.postid
    db.none('UPDATE posts SET title = $1, content = $2 WHERE postid = $3;', [title, content, postid]).then(() => {
        res.redirect('/')
    })
})

app.get('/update-post/:postid', (req, res) => {
    let postid = req.params.postid
    db.any('SELECT postid, title, content FROM posts WHERE postid = $1;', [postid]).then(posts => {
        res.render('update-post', {posts: posts})
    }).catch(error => {
        db.any('SELECT postid, title, content FROM posts ORDER BY postid DESC;').then(posts => {
            res.render('index', {posts: posts, message: "Unable to update posts!"})
        })
    })
})

app.post('/delete-post', (req,res) => {
    let postid = req.body.postid
    db.none('DELETE FROM posts WHERE postid = $1;', [postid]).then(() => {
        res.redirect('/')
    })
})

app.post('/add-post', (req,res) => {
    let title = req.body.title
    let content = req.body.content
    db.none('INSERT INTO posts(title,content) VALUES($1,$2)', [title, content]).then(() => {
        res.redirect('/')
    })
})

app.get('/add-post', (req, res) => {
    res.render('add-post')
})


app.listen(PORT, () => {
    console.log("Server is running...")
})