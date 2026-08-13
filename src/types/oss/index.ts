/**
 * 对象存储配置相关类型
 */

export interface OssConfigRowItem {
  id: number | null
  configName: string
  endpoint: string
  accessKey: string
  bucketName: string
  enableFlag: number
  remark?: string
  createTime?: string
}

export interface OssConfigForm {
  id: number | null
  configName: string
  endpoint: string
  accessKey: string
  secretKey: string
  bucketName: string
  enableFlag: boolean
  remark: string
}

export interface OssFileUploadForm {
  file: File | null
  directory?: string | null
}

export type OssConfigSubmitParams = Omit<OssConfigForm, 'enableFlag'> & {
  enableFlag: number
}

export type OssConfigSearchParams = Partial<
  Pick<OssConfigRowItem, 'configName' | 'bucketName' | 'enableFlag'> & Api.Common.CommonSearchParams
>

export interface OssFileRowItem {
  id: number
  ossConfigId: number
  fileName: string
  objectKey: string
  contentType?: string
  fileSize: number
  fileMd5?: string
  url?: string
  createTime?: string
}

export type OssFileSearchParams = Partial<
  Pick<OssFileRowItem, 'ossConfigId' | 'fileName' | 'contentType'> & Api.Common.CommonSearchParams
>
