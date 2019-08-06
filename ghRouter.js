'use strict'

const express = require('express')
const router = express.Router()
const axios = require('axios')

const ghApiUrlBase = 'https://api.github.com'


/**
 * Compares array of objects in following structure:
 *     {
 *       "lang": "Objective-C",
 *       "projects": [
 *           "HealthVault-Mobile-iOS-Library"
 *       ]
 *   },
 *   by number of projects
 * This is comoparator function as per:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort   
 * @param {*} lang1 - array of projects
 * @param {*} lang2 - array of projects e.g.:
 * [
        "BeanSpy",
        "WindowsAzureToolkitForEclipseWithJava"
    ]
 */
const compareFn = (item1, item2) => {

    if ( item1.projects.length < item2.projects.length) {
      return -1
    }
    if ( item1.projects.length > item2.projects.length) {
      return 1
    }
    // a must be equal to b
    return 0
  }

router.get('/', async (req, res, next) => {
    res.status(500).send('Invalid request, no organization provided.')
    return
})

router.get('/:org', async (req, res, next) => {

  try {
    console.log('ghapi called')
    // console.log(JSON.stringify(req.params))
    const org = req.params.org
    const sortOrder =  (req.query.sortOrder && (req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'))  ?
        req.query.sortOrder :
        'asc'

    const projectMap = new Map()
    

    const url = `${ghApiUrlBase}/orgs/${org}/repos`
    const result = await axios.get(url)
  
    const resultJson = []
    result.data.forEach(item => {
      resultJson.push({
          projectName: item.name,
          projectLang: item.language
      })
    })

    resultJson.forEach(project => {
        // console.log('processing project ' + project.projectName)
        let langProjects = projectMap.get(project.projectLang)

        if (!langProjects) {
            langProjects = []
            projectMap.set(project.projectLang, langProjects)
        }
        langProjects.push(project.projectName)
    })
  
    const apiResult = []
    for (let [key, value] of projectMap.entries()) {
        apiResult.push({
            lang: key,
            projects: value
        })
      }    

    res.send(sortOrder === 'desc' ? apiResult.sort(compareFn).reverse() : apiResult.sort(compareFn))

  } catch (err) {
    res.status(500).send('Opps. Somethign went wrong.')
  }

})

module.exports = router
