const properties = PropertiesService.getScriptProperties()
const SLACK_WEBHOOK_URL: string = properties.getProperty('SLACK_WEBHOOK_URL')
const SLACK_CHANNEL: string = properties.getProperty('SLACK_CHANNEL')
const LABEL_NAME: string = properties.getProperty('LABEL_NAME')
const ICON_EMOJI: string = properties.getProperty('ICON_EMOJI')
const USERNAME: string = properties.getProperty('USERNAME')

const shouldPost = (payload): boolean => {
  if (!payload || !payload.action || !payload.label || !payload.issue) return false
  if (payload.action !== 'labeled') return false
  if ((new RegExp(`\\b${LABEL_NAME}\\b`)).test(payload.label.name) === false) return false

  return true
}

const createPostParams = (payload) => {
  return {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      username: USERNAME,
      icon_emoji: ICON_EMOJI,
      channel: SLACK_CHANNEL,
      link_names: 1,
      attachments: [
        {
          title: `Issue #${payload.issue.number}: ${payload.issue.title}`,
          title_link: payload.issue.html_url,
          text: `LABEL: \`${payload.label.name}\` has been added to the issue!`,
          color: '#7CD197'
        }
      ]
    })
  }
}

const postToSlack = (params): void => {
  UrlFetchApp.fetch(SLACK_WEBHOOK_URL, params)
}

const doPost = (e: PostEvent): void => {
  const payload = JSON.parse(e.postData.getDataAsString())
  if (!shouldPost(payload)) return
  postToSlack(createPostParams(payload))
}

function test(): void {
  Logger.log(
    doPost({
      postData: {
        getDataAsString: () => {
          return JSON.stringify({
            action: 'labeled',
            issue: {
              url: 'http://example.com',
              title: 'example issue',
              number: 4
            },
            label: {
              name: LABEL_NAME
            }
          })
        }
      }
    })
  )
}
