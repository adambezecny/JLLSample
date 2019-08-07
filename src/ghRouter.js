'use strict'

const express = require('express')
const router = express.Router()
const axios = require('axios')
const logger = require('./logger')

const ghApiUrlBase = 'https://api.github.com'

const compareFn = (item1, item2) => {
  if (item1.projects.length < item2.projects.length) {
    return -1
  }
  if (item1.projects.length > item2.projects.length) {
    return 1
  }
  // a must be equal to b
  return 0
}

router.get('/', async (req, res, next) => {
  res.status(500).send('Invalid request, no organization provided.')
})

router.get('/:org', async (req, res, next) => {
  try {
    logger.info('ghapi called')
    logger.trace(JSON.stringify(req.body))
    logger.trace(JSON.stringify(req.query))
    logger.trace(JSON.stringify(req.params))
    const org = req.params.org
    const sortOrder = (req.query.sortOrder && (req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'))
      ? req.query.sortOrder
      : 'asc'

    const projectMap = new Map()

    const url = `${ghApiUrlBase}/orgs/${org}/repos`
    const result = await axios.get(url)

    const ungroupedProjects = []
    result.data.forEach(item => {
      ungroupedProjects.push({
        projectName: item.name,
        projectLang: item.language
      })
    })

    ungroupedProjects.forEach(project => {
      let langProjects = projectMap.get(project.projectLang)

      if (!langProjects) {
        langProjects = []
        projectMap.set(project.projectLang, langProjects)
      }
      langProjects.push(project.projectName)
    })

    const apiResult = []
    for (const [key, value] of projectMap.entries()) {
      apiResult.push({
        lang: key,
        projects: value
      })
    }

    res.send({
      status: 'ok',
      data: sortOrder === 'desc' ? apiResult.sort(compareFn).reverse() : apiResult.sort(compareFn)
    })
  } catch (err) {
    res.status(500).send({
      status: 'error',
      error: 'Opps. Somethign went wrong.',
      origError: err.response && err.response.data ? err.response.data : 'N/A'
    })
  }
})

module.exports = router
