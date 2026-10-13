import request from '@/utils/http'
import {
  WorkflowDefinitionOption,
  WorkflowDefinitionRowItem,
  WorkflowDefinitionSearchParams
} from '@/types/workflow'

/**
 * 分页查询流程定义列表
 */
export function fetchWorkflowDefinitionList(params: WorkflowDefinitionSearchParams) {
  return request.post<WorkflowDefinitionRowItem[]>({
    url: '/api/workflow/definition/page',
    params: params
  })
}

/**
 * 获取流程定义详情
 */
export function getWorkflowDefinition(id: number) {
  return request.get<WorkflowDefinitionRowItem>({
    url: '/api/workflow/definition/' + id
  })
}

/**
 * 获取流程定义下拉选项（流程类别等）
 */
export function getWorkflowDefinitionOptions() {
  return request.get<WorkflowDefinitionOption>({
    url: '/api/workflow/definition/options'
  })
}

/**
 * 新增流程定义
 */
export function createWorkflowDefinition(data: WorkflowDefinitionRowItem) {
  return request.post<boolean>({
    url: '/api/workflow/definition/add',
    data
  })
}

/**
 * 编辑流程定义
 */
export function updateWorkflowDefinition(data: WorkflowDefinitionRowItem) {
  return request.put<boolean>({
    url: '/api/workflow/definition/edit',
    data
  })
}

/**
 * 删除流程定义
 */
export function deleteWorkflowDefinition(id: number) {
  return request.del<boolean>({
    url: '/api/workflow/definition/delete',
    data: { ids: [id] }
  })
}

/**
 * 发布流程定义
 */
export function publishWorkflowDefinition(id: number) {
  return request.put<boolean>({
    url: '/api/workflow/definition/publish',
    params: { id }
  })
}

/**
 * 取消发布流程定义
 */
export function unPublishWorkflowDefinition(id: number) {
  return request.put<boolean>({
    url: '/api/workflow/definition/un-publish',
    params: { id }
  })
}

/**
 * 复制流程定义（生成新版本）
 */
export function copyWorkflowDefinition(id: number) {
  return request.post<boolean>({
    url: '/api/workflow/definition/copy',
    params: { id }
  })
}

/**
 * 激活流程定义
 */
export function activeWorkflowDefinition(id: number) {
  return request.put<boolean>({
    url: '/api/workflow/definition/active',
    params: { id }
  })
}

/**
 * 挂起流程定义
 */
export function unActiveWorkflowDefinition(id: number) {
  return request.put<boolean>({
    url: '/api/workflow/definition/un-active',
    params: { id }
  })
}
