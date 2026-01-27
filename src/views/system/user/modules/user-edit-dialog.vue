<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
    width="55%"
    align-center
    @close="handleClose"
    destroy-on-close
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px">
      <ElRow>
        <ElCol :span="12">
          <ElFormItem label="用户名" prop="userName">
            <ElInput v-model="form.userName" placeholder="请输入用户名" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="用户名称" prop="nickName">
            <ElInput v-model="form.nickName" placeholder="请输入昵称" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="12">
          <ElFormItem label="部门" prop="deptId" clearable>
            <ElTreeSelect
              v-model="form.deptId"
              :data="allDeptList"
              :render-after-expand="false"
              check-strictly
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="用户邮箱" prop="userEmail">
            <ElInput v-model="form.userEmail" placeholder="请输入用户邮箱" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="12">
          <ElFormItem label="性别" prop="userGender">
            <ElRadioGroup v-model="form.userGender">
              <ElRadio v-for="item in genderOptions" :key="item.dictValue" :value="item.dictValue">
                {{ item.dictLabel }}
              </ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="电话" prop="userPhone">
            <ElInput v-model="form.userPhone" placeholder="请输入电话" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="12">
          <ElFormItem label="角色" prop="roleIds">
            <ElSelect v-model="form.roleIds" multiple placeholder="请选择角色">
              <ElOption
                v-for="role in roleList"
                :key="role.value"
                :label="role.label"
                :value="role.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="是否启用" prop="enableFlag">
            <ElSwitch v-model="form.enableFlag" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="24">
          <ElFormItem label="地址" prop="userAddress">
            <ElInput v-model="form.userAddress" placeholder="请输入地址" />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { addUser, editUser } from '@/api/user'
  import { UserRowItem } from '@/types/user'
  import { DeptOptionItem } from '@/types/dept'
  import { getDeptTreeNoTop } from '@/api/dept'
  import { fetchGetRoleSelect } from '@/api/role'
  import { getDict } from '@/utils/dict'
  import { type DictItem } from '@/types/dict'

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    userData?: UserRowItem
    deptId?: number
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    userData: undefined,
    deptId: undefined
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()

  const roleList = ref<Api.SystemManage.RoleOptionItem[]>([])
  const allDeptList = ref<DeptOptionItem[]>([])
  const genderOptions = ref<DictItem[]>([])

  /**
   * 弹窗显示状态双向绑定
   */
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  /**
   * 表单验证规则
   */
  const rules = reactive<FormRules>({
    userName: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    nickName: [
      { required: true, message: '请输入用户名称', trigger: 'blur' },
      { min: 2, max: 40, message: '长度在 2 到 40 个字符', trigger: 'blur' }
    ],
    roleIds: [{ required: true, message: '请选择角色', trigger: 'blur' }]
  })

  /**
   * 表单数据
   */
  const form = reactive<UserRowItem>({
    id: undefined,
    enableFlag: true,
    userName: '',
    nickName: '',
    password: '',
    deptId: undefined,
    userStatus: '',
    userEmail: '',
    userGender: '',
    userPhone: '',
    userAddress: '',
    userDescription: '',
    userTag: '',
    roleIds: []
  })

  /**
   * 监听用户数据变化，更新表单
   */
  watch(
    () => props.userData,
    (newData) => {
      if (newData && props.modelValue) initForm()
    },
    { deep: true }
  )

  /**
   * 监听弹窗打开，初始化表单数据
   */
  watch(
    () => props.modelValue,
    async (newVal) => {
      if (newVal) {
        initForm()
        if (props.deptId && props.dialogType === 'add') {
          form.deptId = props.deptId
        }
        getDeptTreeNoTop().then((res) => (allDeptList.value = res))
        fetchGetRoleSelect().then((res) => (roleList.value = res))
        getDict('system_gender').then((res) => {
          genderOptions.value = res
          form.userGender = genderOptions.value[0].dictValue
        })
      }
    }
  )

  /**
   * 初始化表单数据
   * 根据弹窗类型填充表单或重置表单
   */
  const initForm = () => {
    if (props.dialogType === 'edit' && props.userData) {
      Object.assign(form, props.userData)
    } else {
      Object.assign(form, {
        id: undefined,
        enableFlag: true,
        userName: '',
        nickName: '',
        password: '',
        deptId: undefined,
        userStatus: '',
        userEmail: '',
        userGender: '',
        userPhone: '',
        userAddress: '',
        userDescription: '',
        userTag: '',
        roleIds: []
      })
    }
  }

  /**
   * 关闭弹窗并重置表单
   */
  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
  }

  /**
   * 提交表单
   * 验证通过后调用接口保存数据
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      // 调用新增/编辑接口
      const message = props.dialogType === 'add' ? '新增成功' : '修改成功'
      let res: Promise<boolean>
      if (props.dialogType === 'add') {
        res = addUser(form)
      } else {
        res = editUser(form)
      }
      res.then((res) => {
        if (res) {
          ElMessage.success(message)
          emit('success')
          handleClose()
        }
      })
    } catch (error) {
      console.log('表单验证失败:', error)
    }
  }
</script>
