const axios = require('axios')

const CI_USER_TOKEN = process.env['CI_USER_TOKEN']

axios.post("https://api.github.com/repos/SwiftGGTeam/SwiftGGTeam.github.io/pulls", {
    title: 'merge stage to master',
    head: 'master',
    base: 'aliyun-pages',
  }, {
    headers: {
      'Authorization': `token ${CI_USER_TOKEN}`,
    }
  })
.then((result) => {
  console.log(`PR created ${result.data.html_url}`)
  const { number } = result.data
  if (!number) {
    console.error(`${number} error`)
    process.exit(1)
  }
  setTimeout(() => {
    // sometimes if request merge after created, API return error. so we delay 3s
    axios.put(`https://api.github.com/repos/SwiftGGTeam/SwiftGGTeam.github.io/pulls/${number}/merge`, {
      merge_method: 'merge'
    }, {
        headers: {
          'Authorization': `token ${CI_USER_TOKEN}`,
        }
      })
      .then((result) => {
        console.log('merge success! API result is:')
        console.log(result.data)
      }).catch((err) => {
        console.log(err.response)
        process.exit(1)
      });
  }, 3000 * 1000);
}).catch((err) => {
  console.log(err.response.data.errors)
  process.exit(1)
});