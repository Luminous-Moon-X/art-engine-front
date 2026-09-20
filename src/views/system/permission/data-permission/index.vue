<!-- 数据权限管理页面 -->
<template>
  <div class="art-full-height">
    <!-- 搜索区域 -->
    <ArtSearchBar
      v-model="searchFormState"
      :items="searchItems"
      :show-reset="true"
      :show-search="true"
      label-width="100px"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增规则</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
    </ElCard>

    <!-- 数据权限新增/编辑弹窗 -->
    <DataPermissionEditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :permission-data="currentPermissionData"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import {
    fetchDataPermissionPage,
    deleteDataPermission,
    updateDataPermissionStatus
  } from '@/api/data-permission'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import DataPermissionEditDialog from './modules/data-permission-edit-dialog.vue'
  import { ElMessageBox, ElTag, ElText } from 'element-plus'
  import { DataPermissionRowItem } from '@/types/data-permission'
  import { getDict } from '@/utils/dict'
  import { loadAllSubjectOptions, type SubjectOption } from './modules/subject-options'
  import type { DictItem } from '@/types/dict'
  import type { VNode } from 'vue'

  defineOptions({ name: 'DataPermission' })

  // --- 搜索相关 ---
  const searchFormState = ref<{
    subjectType: string
    permissionSubject: string
    permissionObject: string
    enableFlag: boolean | ''
  }>({
    subjectType: '',
    permissionSubject: '',
    permissionObject: '',
    enableFlag: ''
  })

  /**
   * 授权主体类型下拉选项（数据字典 system_permission_subject_type）
   */
  const subjectTypeOptions = ref<DictItem[]>([])

  /**
   * 授权范围下拉选项（数据字典 system_permission_scope）
   */
  const permissionScopeOptions = ref<DictItem[]>([])

  /**
   * 授权主体选项：授权主体类型 -> 主体选项列表
   * 用于表格按类型把主体ID回显为主体名称
   */
  const subjectOptionsMap = ref<Record<string, SubjectOption[]>>({})

  onMounted(() => {
    getDict('system_permission_subject_type').then((res) => {
      subjectTypeOptions.value = res || []
    })
    getDict('system_permission_scope').then((res) => {
      permissionScopeOptions.value = res || []
    })
    loadAllSubjectOptions()
      .then((res) => {
        subjectOptionsMap.value = res
      })
      .catch((err) => {
        console.error('[数据权限] 授权主体名称加载失败：', err)
      })
  })

  /**
   * 字典值转字典标签
   *
   * @param list 字典项列表
   * @param value 字典值
   * @returns 字典标签，取不到时回退为原值
   */
  const toDictLabel = (list: DictItem[], value?: string): string => {
    if (!value) return '-'
    return list.find((item) => item.dictValue === String(value))?.dictLabel || value
  }

  /**
   * 授权主体ID转主体名称
   *
   * @param row 数据权限行数据
   * @returns 主体名称，取不到时回退为主体ID
   */
  const getSubjectLabel = (row: DataPermissionRowItem): string => {
    if (!row.permissionSubject) return '-'
    const options = subjectOptionsMap.value[row.subjectType] || []
    const matched = options.find((item) => item.value === String(row.permissionSubject))
    return matched ? matched.label : row.permissionSubject
  }

  const searchItems = computed(() => [
    {
      key: 'subjectType',
      label: '授权主体类型',
      type: 'select',
      props: {
        placeholder: '请选择授权主体类型',
        clearable: true,
        options: subjectTypeOptions.value.map((item) => ({
          label: item.dictLabel,
          value: item.dictValue
        }))
      }
    },
    {
      key: 'permissionSubject',
      label: '授权主体',
      type: 'input',
      props: { placeholder: '请输入授权主体' }
    },
    {
      key: 'permissionObject',
      label: '授权客体',
      type: 'input',
      props: { placeholder: '请输入授权客体' }
    },
    {
      key: 'enableFlag',
      label: '是否启用',
      type: 'select',
      props: {
        placeholder: '请选择',
        clearable: true,
        options: [
          { label: '启用', value: true },
          { label: '禁用', value: false }
        ]
      }
    }
  ])

  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentPermissionData = ref<DataPermissionRowItem | undefined>(undefined)

  // 表格相关
  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: fetchDataPermissionPage,
      apiParams: {
        pageNumber: 1,
        pageSize: 20
      },
      columnsFactory: () => [
        {
          prop: 'subjectType',
          label: '授权主体类型',
          minWidth: 150,
          formatter: (row: DataPermissionRowItem) =>
            h(ElText, {}, toDictLabel(subjectTypeOptions.value, row.subjectType))
        },
        {
          prop: 'permissionSubject',
          label: '授权主体',
          minWidth: 160,
          formatter: (row: DataPermissionRowItem) => h(ElText, {}, getSubjectLabel(row))
        },
        {
          prop: 'permissionObject',
          label: '授权客体',
          minWidth: 160,
          formatter: (row: DataPermissionRowItem) => h(ElText, {}, row.permissionObject || '-')
        },
        {
          prop: 'permissionScope',
          label: '授权范围',
          minWidth: 150,
          formatter: (row: DataPermissionRowItem) =>
            h(ElText, {}, toDictLabel(permissionScopeOptions.value, row.permissionScope))
        },
        {
          prop: 'enableFlag',
          label: '是否启用',
          width: 120,
          formatter: (row: DataPermissionRowItem) => {
            const statusConfig = row.enableFlag
              ? { type: 'success', text: '启用' }
              : { type: 'warning', text: '禁用' }
            return h(
              ElTag,
              { type: statusConfig.type as 'success' | 'warning' },
              () => statusConfig.text
            )
          }
        },
        {
          prop: 'operation',
          label: '操作',
          width: 160,
          fixed: 'right',
          align: 'center',
          formatter: (row: DataPermissionRowItem) => {
            const buttons: VNode[] = []
            if (row.enableFlag) {
              buttons.push(
                h(ArtButtonTable, {
                  icon: 'ri:pause-circle-line',
                  iconClass: 'bg-warning/12 text-warning',
                  onClick: () => handleToggleStatus(row, false)
                })
              )
            } else {
              buttons.push(
                h(ArtButtonTable, {
                  icon: 'ri:play-circle-line',
                  iconClass: 'bg-success/12 text-success',
                  onClick: () => handleToggleStatus(row, true)
                })
              )
            }
            buttons.push(
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => handleEdit(row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => handleDelete(row)
              })
            )
            return h('div', { class: 'flex justify-center' }, buttons)
          }
        }
      ]
    }
  })

  // 打开新增/编辑弹窗
  const showDialog = (type: 'add' | 'edit', row?: DataPermissionRowItem) => {
    dialogType.value = type
    currentPermissionData.value = row
    dialogVisible.value = true
  }

  /**
   * 搜索处理
   */
  const handleSearch = () => {
    Object.assign(searchParams, searchFormState.value)
    getData()
  }

  // 重置查询条件
  const handleReset = () => {
    resetSearchParams()
  }

  // 编辑数据权限
  const handleEdit = (row: DataPermissionRowItem) => {
    showDialog('edit', row)
  }

  // 启用/禁用数据权限
  const handleToggleStatus = (row: DataPermissionRowItem, enableFlag: boolean) => {
    const action = enableFlag ? '启用' : '禁用'
    ElMessageBox.confirm(`确定${action}该条数据权限规则吗？`, `${action}确认`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        updateDataPermissionStatus(row.id as number, enableFlag).then((res) => {
          if (res) {
            ElMessage.success(`${action}成功`)
            refreshData()
          }
        })
      })
      .catch(() => {})
  }

  // 删除数据权限
  const handleDelete = (row: DataPermissionRowItem) => {
    ElMessageBox.confirm('确定删除该条数据权限规则吗？此操作不可恢复！', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        deleteDataPermission([row.id as number]).then((res) => {
          if (res) {
            ElMessage.success('删除成功')
            refreshData()
          }
        })
      })
      .catch(() => {})
  }
</script>
