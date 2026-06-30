import fs from 'fs'
import path from 'path'
import 'dotenv/config'

// the client IDs and secrets for the different environments
// set these values here or your preferred way to store them

const config = {
  dev: {
    clientId: process.env.CLIENT_ID_DEV || '',
    clientSecret: process.env.CLIENT_SECRET_DEV || '',
    cdpUrl: 'https://cdp-uploader.dev.cdp-int.defra.cloud',
    apiBaseUrl: 'https://land-grants-api.api.dev.cdp-int.defra.cloud',
    tokenUrl:
      'https://land-grants-api-c63f2.auth.eu-west-2.amazoncognito.com/oauth2/token'
  },
  test: {
    clientId: process.env.CLIENT_ID_TEST || '',
    clientSecret: process.env.CLIENT_SECRET_TEST || '',
    cdpUrl: 'https://cdp-uploader.test.cdp-int.defra.cloud',
    apiBaseUrl: 'https://land-grants-api.api.test.cdp-int.defra.cloud',
    tokenUrl:
      'https://land-grants-api-6bf3a.auth.eu-west-2.amazoncognito.com/oauth2/token'
  },
  'perf-test': {
    clientId: process.env.CLIENT_ID_PERF_TEST || '',
    clientSecret: process.env.CLIENT_SECRET_PERF_TEST || '',
    cdpUrl: 'https://cdp-uploader.perf-test.cdp-int.defra.cloud',
    apiBaseUrl: 'https://land-grants-api.api.perf-test.cdp-int.defra.cloud',
    tokenUrl:
      'https://land-grants-api-05244.auth.eu-west-2.amazoncognito.com/oauth2/token'
  },
  'ext-test': {
    clientId: process.env.CLIENT_ID_EXT_TEST || '',
    clientSecret: process.env.CLIENT_SECRET_EXT_TEST || '',
    cdpUrl: 'https://cdp-uploader.ext-test.cdp-int.defra.cloud',
    apiBaseUrl: 'https://land-grants-api.api.ext-test.cdp-int.defra.cloud',
    tokenUrl:
      'https://land-grants-api-8ec5c.auth.eu-west-2.amazoncognito.com/oauth2/token'
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
      const body = await response.text()
      console.log(
        `✗ Failed - Check if API is running at ${apiBaseUrl} - HTTP ${response.status}`
      )
      throw new Error(
        `Failed to initiate land data upload - HTTP ${response.status}\n${body}`
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

function isSuccessfulUploadStatus(uploadStatusResponse) {
  const status = `${uploadStatusResponse?.uploadStatus ?? ''}`
    .trim()
    .toLowerCase()

  const successfulStatuses = new Set([
    'initiated',
    'accepted',
    'received',
    'queued',
    'pending',
    'uploaded',
    'uploading',
    'processing',
    'processed',
    'complete',
    'completed',
    'success',
    'succeeded'
  ])

  const failureStatuses = new Set([
    'failed',
    'failure',
    'error',
    'errored',
    'aborted',
    'cancelled'
  ])

  if (failureStatuses.has(status)) {
    return false
  }

  return successfulStatuses.has(status)
}

/**
 * Upload file to endpoint with authentication
 * @param {string} uploadUrl - Upload URL
 * @param {string} filePath - Path to file to upload
 * @param {string} accessToken - Bearer token
 * @returns {Promise<void>}
 */
async function uploadFileToS3(uploadUrl, filePath, accessToken) {
  try {
    console.log(`✓ Uploading file to S3 ${uploadUrl}`)

    const fileContent = fs.readFileSync(filePath)
    const fileName = path.basename(filePath)
    const contentType = filePath.endsWith('.csv')
      ? 'text/csv'
      : 'application/zip'

    if (fileContent.length === 0) {
      throw new Error(`File is empty: ${filePath}`)
    }

    // Quick sanity check that the file looks like a zip
    if (contentType === 'application/zip') {
      const signature = fileContent.slice(0, 4).toString('hex')
      if (signature !== '504b0304') {
        console.log(`✗ ZIP signature mismatch: ${signature}`)
        throw new Error(`File does not look like a ZIP: ${filePath}`)
      }
    }

    await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'content-type': contentType,
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
export async function transferResource(
  landDataFile,
  resource,
  environment,
  ingestId,
  filename,
  accessToken = null
) {
  const { clientId, clientSecret } = config[environment]

  if (!clientId || !clientSecret) {
    throw new Error('CLIENT_ID and CLIENT_SECRET must be set')
  }

  // metadata for the ingestion, to identify who by and when the ingestion was performed
  const reference = new Date().toISOString().replace('T', ':').slice(0, 19)
  const customerId = 'QA_TEAM'

  // get the access token from cognito unless one was supplied by the caller
  const token = accessToken ?? (await getCognitoToken(environment))
  console.log(`${token !== undefined ? '✓' : '✗'} Access token retrieved`)

  console.log(`✓ Start ingesting ${landDataFile}`)

  const initiateUploadResponse = await initiateLandDataUpload(
    {
      reference,
      customerId,
      resource,
      ingestId,
      filename
    },
    token,
    environment
  )

  console.log(`✓ Initiate upload successful for ${landDataFile}`)

  // Upload the file to S3
  await uploadFileToS3(initiateUploadResponse.uploadUrl, landDataFile, token)

  // Check the upload status.
  const uploadStatusResponse = await checkUploadStatus(
    initiateUploadResponse.uploadUrl.split('/').pop(),
    token,
    environment
  )

  if (isSuccessfulUploadStatus(uploadStatusResponse)) {
    console.log(
      `✓ File upload successful and ${uploadStatusResponse.uploadStatus} status for ${landDataFile}`
    )
  } else {
    console.log(
      `✗ Upload status is not successful for ${landDataFile}: ${uploadStatusResponse.uploadStatus}`
    )
    throw new Error(
      `Upload status is not successful: ${uploadStatusResponse.uploadStatus}`
    )
  }

  console.log('✓ Ingestion complete for : ' + resource)
}

export async function transferResources(
  files,
  resource,
  environment,
  ingestId,
  delayMs = 2000,
  accessToken = null
) {
  if (!Array.isArray(files) || files.length === 0) {
    return
  }

  const token = accessToken ?? (await getCognitoToken(environment))

  for (let index = 0; index < files.length; index += 1) {
    const filePath = files[index]
    const filename = path.basename(filePath)

    if (!fs.existsSync(filePath)) {
      console.log(`⚠ Skipping missing file: ${filePath}`)
      continue
    }

    console.log(
      `Transferring ${index + 1}/${files.length} file(s): ${filename}`
    )

    await transferResource(
      filePath,
      resource,
      environment,
      ingestId,
      filename,
      token
    )

    if (delayMs > 0 && index < files.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
}
