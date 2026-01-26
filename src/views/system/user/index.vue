<!-- 用户管理页面 -->
<template>
  <div class="art-full-height">
    <!-- 搜索区域 -->
    <ArtSearchBar
      ref="searchBarRef"
      v-model="searchFormState"
      :items="searchItems"
      :show-reset-button="true"
      :show-search-button="true"
      v-show="showSearchBar"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard
      class="art-table-card"
      shadow="never"
      :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
    >
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="handleAdd()" v-ripple>新增用户</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        rowKey="id"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
    </ElCard>

    <!-- 用户编辑弹窗 -->
    <UserEditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :user-data="currentUserData"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetUserList, delUser } from '@/api/user'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import UserEditDialog from './modules/user-edit-dialog.vue'
  import { ElTag, ElMessageBox } from 'element-plus'
  import { UserRowItem } from '@/types/user'

  defineOptions({ name: 'User' })

  // --- 搜索相关 ---
  const showSearchBar = ref(false)
  const searchFormState = ref({
    deptName: '',
    chargePerson: ''
  })

  const searchItems = computed(() => [
    {
      key: 'userName',
      label: '用户名',
      type: 'input',
      props: { placeholder: '请输入用户名' }
    },
    {
      key: 'nickName',
      label: '用户名称',
      type: 'input',
      props: { placeholder: '请输入用户名称' }
    }
  ])

  const dialogVisible = ref(false)
  const currentUserData = ref<UserRowItem | undefined>(undefined)

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
    // 核心配置
    core: {
      apiFn: fetchGetUserList,
      apiParams: {
        pageNumber: 1,
        pageSize: 20
      },
      // 排除 apiParams 中的属性
      excludeParams: ['daterange'],
      columnsFactory: () => [
        {
          prop: 'id',
          label: '用户ID',
          visible: false
        },
        {
          prop: 'nickName',
          label: '用户名称',
          minWidth: 200
        },
        {
          prop: 'userName',
          label: '用户名',
          width: 200
        },
        {
          prop: 'userGender',
          label: '用户性别',
          width: 180,
          formatter: (row: UserRowItem) => {
            return row.userGender === '0' ? '女' : '男'
          }
        },
        {
          prop: 'userPhone',
          label: '手机号',
          width: 200
        },
        {
          prop: 'userEmail',
          label: '邮箱',
          width: 260
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: 260
        },
        {
          prop: 'enableFlag',
          label: '是否启用',
          width: 150,
          formatter: (row: UserRowItem) => {
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
          width: 170,
          fixed: 'right',
          align: 'center',
          formatter: (row: UserRowItem) =>
            h('div', { style: 'text-align: right' }, [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => handleEdit(row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => handleDelete(row)
              })
            ])
        }
      ]
    }
  })

  // 弹窗类型 新增or修改
  const dialogType = ref<'add' | 'edit'>('add')

  // 打开新增/修改弹窗
  const showDialog = (type: 'add' | 'edit', row?: UserRowItem) => {
    dialogVisible.value = true
    dialogType.value = type
    currentUserData.value = row
  }

  /**
   * 搜索处理
   */
  const handleSearch = () => {
    // 搜索参数赋值
    Object.assign(searchParams, searchFormState.value)
    getData()
  }

  // 重置查询条件
  const handleReset = () => {
    resetSearchParams()
  }

  // 新增用户
  const handleAdd = (row?: UserRowItem) => {
    showDialog('add', row)
  }

  // 编辑用户
  const handleEdit = (row: UserRowItem) => {
    showDialog('edit', row)
  }

  // 删除用户
  const handleDelete = (row: UserRowItem) => {
    ElMessageBox.confirm(`确定删除用户"${row.userName}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        delUser(row.id as number).then((res) => {
          if (res) {
            ElMessage.success('删除成功')
            refreshData()
          }
        })
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }
</script>
