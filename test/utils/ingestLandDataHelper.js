import fs from 'fs'
import path from 'path'
import 'dotenv/config'

// the client IDs and secrets for the different environments
// set these values here or your preferred way to store them
const CLIENT_ID_DEV = process.env.dev_ClientID
const CLIENT_SECRET_DEV = process.env.dev_ClientSecret

const config = {
  dev: {
    clientId: CLIENT_ID_DEV || '',
    clientSecret: CLIENT_SECRET_DEV || '',
    cdpUrl: 'https://cdp-uploader.dev.cdp-int.defra.cloud',
    apiBaseUrl: 'https://land-grants-api.api.dev.cdp-int.defra.cloud',
    tokenUrl:
      'https://land-grants-api-c63f2.auth.eu-west-2.amazoncognito.com/oauth2/token'
  }
}

async function getCognitoToken(environment) {
  try {
    const envConfig = config[environment]
    console.log(`✓ Getting Cognito token from ${envConfig.tokenUrl}`)

    const credentials = Buffer.from(
      `${envConfig.clientId}:${envConfig.clientSecret}`
    ).toString('base64')

    const response = await fetch(envConfig.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Error: HTTP ${response.status}\n${body}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.log(`✗ Get Cognito token failed - ${error}`)
    throw error
  }
}

async function initiateLandDataUpload(jsonData, accessToken, environment) {
  try {
    const apiBaseUrl = config[environment].apiBaseUrl
    console.log(
      `✓ Initiating land data upload to ${apiBaseUrl}/initiate-upload`
    )

    const response = await fetch(`${apiBaseUrl}/initiate-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(jsonData)
    })

    if (!response.ok) {
      console.log(
        `✗ Failed - Check if API is running at ${apiBaseUrl} - HTTP ${response.status}`
      )
      throw new Error(
        `Failed to initiate land data upload - HTTP ${response.status}`
      )
    }

    return await response.json()
  } catch (error) {
    console.log(`✗ Failed to initiate land data upload - ${error.message}`)
    throw error
  }
}

async function checkUploadStatus(uploadId, accessToken, environment) {
  try {
    const apiBaseUrl = config[environment].cdpUrl
    console.log(
      `✓ Getting CDP Uploader status from ${apiBaseUrl}/status/${uploadId}`
    )

    const response = await fetch(`${apiBaseUrl}/status/${uploadId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    if (!response.ok) {
      console.log(`✗ Failed to check upload status - HTTP ${response.status}`)
      throw new Error(`Failed to check upload status - HTTP ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.log(`✗ Failed to check upload status - ${error}`)
    throw error
  }
}

async function uploadFileToS3(uploadUrl, filePath, accessToken) {
  try {
    console.log(`✓ Uploading file to S3 ${uploadUrl}`)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const fileName = path.basename(filePath)

    await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'content-type': 'text/csv',
        'x-filename': fileName
      },
      body: fileContent,
      redirect: 'manual'
    })
  } catch (error) {
    console.log(`✗ Failed to upload file to S3 - ${error}`)
    throw error
  }
}

/**
 * Main function to run the ingestion process
 */
export async function transferResource(landDataFile, resource, environment) {
  const { clientId, clientSecret } = config[environment]

  if (!clientId || !clientSecret) {
    throw new Error('CLIENT_ID and CLIENT_SECRET must be set')
  }

  // metadata for the ingestion, to identify who by and when the ingestion was performed
  const reference = new Date().toISOString().replace('T', ':').slice(0, 19)
  const customerId = 'QA_TEAM'

  // get the access token from cognito
  const accessToken = await getCognitoToken(environment)
  console.log(`${accessToken !== undefined ? '✓' : '✗'} Access token retrieved`)

  console.log(`✓ Start ingesting ${landDataFile}`)

  const initiateUploadResponse = await initiateLandDataUpload(
    {
      reference,
      customerId,
      resource
    },
    accessToken,
    environment
  )

  console.log(`✓ Initiate upload successful for ${landDataFile}`)

  // Upload the file to S3
  await uploadFileToS3(
    initiateUploadResponse.uploadUrl,
    landDataFile,
    accessToken
  )

  // Check the upload status, should be pending
  const uploadStatusResponse = await checkUploadStatus(
    initiateUploadResponse.uploadUrl.split('/').pop(),
    accessToken,
    environment
  )

  if (uploadStatusResponse.uploadStatus === 'pending') {
    console.log(
      `✓ File upload successful and ${uploadStatusResponse.uploadStatus} status for ${landDataFile}`
    )
  } else {
    console.log(`✗ Upload status is not pending for ${landDataFile}`)
    throw new Error(`Upload status is not pending`)
  }

  console.log('✓ Ingestion complete for : ' + resource)
}
