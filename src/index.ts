const properties = PropertiesService.getScriptProperties()
const SLACK_WEBHOOK_URL: string = properties.getProperty('SLACK_WEBHOOK_URL')
const SLACK_CHANNEL: string = properties.getProperty('SLACK_CHANNEL')
const LABEL_NAME: string = properties.getProperty('LABEL_NAME')
const ICON_EMOJI: string = properties.getProperty('ICON_EMOJI')
const USERNAME: string = properties.getProperty('USERNAME')

const shouldPost = (payload): boolean => {
  if (!payload || !payload.action || !payload.label || !payload.issue) { return false }
  if (payload.action !== 'labeled') { return false }
  if ((new RegExp(`\\b${LABEL_NAME}\\b`)).test(payload.label.name) === false) { return false }

  return true
}

const createPostParams = (payload) => {
  return {
    contentType: 'application/json',
    method: 'post',
    payload: JSON.stringify({
      attachments: [
        {
          color: '#7CD197',
          text: `LABEL: \`${payload.label.name}\` has been added to the issue!`,
          title: `Issue #${payload.issue.number}: ${payload.issue.title}`,
          title_link: payload.issue.html_url,
        },
      ],
      channel: SLACK_CHANNEL,
      icon_emoji: ICON_EMOJI,
      link_names: 1,
      username: USERNAME,
    }),
  }
}

const postToSlack = (params): void => {
  UrlFetchApp.fetch(SLACK_WEBHOOK_URL, params)
}

const doPost = (e: PostEvent): void => {
  const payload = JSON.parse(e.postData.getDataAsString())
  if (!shouldPost(payload)) { return }
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
              number: 4,
              title: 'example issue',
              url: 'http://example.com',
            },
            label: {
              name: LABEL_NAME,
            },
          })
        },
      },
    }),
  )
}
