<!-- 个人中心页面 -->
<template>
  <div class="w-full h-full p-0 bg-transparent border-none shadow-none">
    <div class="relative flex-b mt-2.5 max-md:block max-md:mt-1">
      <div class="w-112 mr-5 max-md:w-full max-md:mr-0">
        <div class="art-card-sm relative p-9 pb-6 overflow-hidden text-center">
          <img class="absolute top-0 left-0 w-full h-50 object-cover" src="@imgs/user/bg.webp" />
          <img
            class="relative z-10 w-20 h-20 mt-30 mx-auto object-cover border-2 border-white rounded-full"
            src="@imgs/user/avatar.webp"
          />
          <h2 class="mt-5 text-xl font-normal">{{ userInfo.userName }}</h2>
          <p class="mt-5 text-sm">{{ form.userDescription || '暂无个人介绍' }}</p>

          <div class="w-75 mx-auto mt-7.5 text-left">
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:mail-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ form.userEmail || '暂无邮箱' }}</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:phone-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ form.userPhone || '暂无手机' }}</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:map-pin-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ form.userAddress || '暂无地址' }}</span>
            </div>
          </div>

          <div class="mt-10" v-if="tagList.length > 0">
            <h3 class="text-sm font-medium">标签</h3>
            <div class="flex flex-wrap justify-center mt-3.5">
              <div
                v-for="item in tagList"
                :key="item"
                class="py-1 px-1.5 mr-2.5 mb-2.5 text-xs border border-g-300 rounded"
              >
                {{ item }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-1 overflow-hidden max-md:w-full max-md:mt-3.5">
        <div class="art-card-sm">
          <h1 class="p-4 text-xl font-normal border-b border-g-300">基本设置</h1>

          <ElForm
            :model="form"
            class="box-border p-5 [&>.el-row_.el-form-item]:w-[calc(50%-10px)] [&>.el-row_.el-input]:w-full [&>.el-row_.el-select]:w-full"
            ref="ruleFormRef"
            :rules="rules"
            label-width="86px"
            label-position="top"
          >
            <ElRow>
              <ElFormItem label="用户名" prop="userName">
                <ElInput v-model="form.userName" disabled />
              </ElFormItem>
              <ElFormItem label="性别" prop="userGender" class="ml-5">
                <ElSelect v-model="form.userGender" placeholder="请选择性别" :disabled="!isEdit">
                  <ElOption
                    v-for="item in genderOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem label="昵称" prop="nickName">
                <ElInput v-model="form.nickName" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="邮箱" prop="userEmail" class="ml-5">
                <ElInput v-model="form.userEmail" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem label="手机" prop="userPhone">
                <ElInput v-model="form.userPhone" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="地址" prop="userAddress" class="ml-5">
                <ElInput v-model="form.userAddress" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElFormItem label="个人介绍" prop="userDescription" class="h-32">
              <ElInput
                type="textarea"
                :rows="4"
                v-model="form.userDescription"
                :disabled="!isEdit"
              />
            </ElFormItem>

            <ElFormItem label="标签">
              <div v-if="isEdit" class="flex flex-wrap gap-2">
                <ElTag
                  v-for="tag in tagList"
                  :key="tag"
                  closable
                  type="info"
                  @close="handleTagClose(tag)"
                >
                  {{ tag }}
                </ElTag>
                <ElInput
                  v-if="inputVisible"
                  ref="inputRef"
                  v-model="inputValue"
                  class="w-20"
                  size="small"
                  @keyup.enter="handleInputConfirm"
                  @blur="handleInputConfirm"
                />
                <ElButton v-else size="small" @click="showInput">+ 添加标签</ElButton>
              </div>
              <div v-else class="flex flex-wrap gap-2">
                <ElTag v-for="tag in tagList" :key="tag" type="info">{{ tag }}</ElTag>
                <span v-if="tagList.length === 0" class="text-g-500 text-sm">暂无标签</span>
              </div>
            </ElFormItem>

            <div class="flex-c justify-end [&_.el-button]:!w-27.5">
              <ElButton
                type="primary"
                class="w-22.5"
                v-ripple
                @click="handleEdit"
                :loading="loading"
              >
                {{ isEdit ? '保存' : '编辑' }}
              </ElButton>
              <ElButton v-if="isEdit" class="w-22.5 ml-2.5" @click="handleCancel">取消</ElButton>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '@/store/modules/user'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage, ElInput } from 'element-plus'
  import { fetchGetUserById, editUser } from '@/api/user'
  import type { UserRowItem } from '@/types/user'

  defineOptions({ name: 'UserCenter' })

  const userStore = useUserStore()
  const userInfo = computed(() => userStore.getUserInfo)

  const isEdit = ref(false)
  const loading = ref(false)
  const ruleFormRef = ref<FormInstance>()
  const originalForm = ref<UserRowItem | null>(null)

  // 标签输入相关
  const inputRef = ref<InstanceType<typeof ElInput>>()
  const inputVisible = ref(false)
  const inputValue = ref('')

  /**
   * 用户信息表单
   */
  const form = reactive<UserRowItem>({
    id: undefined,
    enableFlag: true,
    userName: '',
    nickName: '',
    password: '',
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
   * 表单验证规则
   */
  const rules = reactive<FormRules>({
    nickName: [
      { required: true, message: '请输入昵称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    userEmail: [
      { required: false, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    userPhone: [
      { required: false, message: '请输入手机号码', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ]
  })

  /**
   * 性别选项
   */
  const genderOptions = [
    { value: '1', label: '男' },
    { value: '2', label: '女' }
  ]

  /**
   * 标签列表
   */
  const tagList = computed(() => {
    if (!form.userTag) return []
    return form.userTag.split(',').filter((tag) => tag.trim())
  })

  /**
   * 关闭标签
   */
  const handleTagClose = (tag: string) => {
    const tags = tagList.value.filter((t) => t !== tag)
    form.userTag = tags.join(',')
  }

  /**
   * 显示标签输入框
   */
  const showInput = () => {
    inputVisible.value = true
    nextTick(() => {
      inputRef.value?.focus()
    })
  }

  /**
   * 确认输入标签
   */
  const handleInputConfirm = () => {
    if (inputValue.value.trim()) {
      const tags = [...tagList.value]
      if (!tags.includes(inputValue.value.trim())) {
        tags.push(inputValue.value.trim())
        form.userTag = tags.join(',')
      }
    }
    inputVisible.value = false
    inputValue.value = ''
  }

  /**
   * 获取用户详细信息
   */
  const fetchUserInfo = async () => {
    const userId = userInfo.value.userId
    if (!userId) return

    try {
      const data = await fetchGetUserById(userId)
      if (data) {
        Object.assign(form, data)
        originalForm.value = { ...data }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  /**
   * 切换编辑状态
   */
  const handleEdit = async () => {
    if (isEdit.value) {
      // 保存
      const valid = await ruleFormRef.value?.validate()
      if (!valid) return

      loading.value = true
      try {
        const success = await editUser(form)
        if (success) {
          ElMessage.success('修改成功')
          originalForm.value = { ...form }
          isEdit.value = false
        }
      } catch (error) {
        console.error('保存用户信息失败:', error)
      } finally {
        loading.value = false
      }
    } else {
      // 进入编辑模式
      isEdit.value = true
    }
  }

  /**
   * 取消编辑
   */
  const handleCancel = () => {
    if (originalForm.value) {
      Object.assign(form, originalForm.value)
    }
    ruleFormRef.value?.clearValidate()
    isEdit.value = false
  }

  onMounted(() => {
    fetchUserInfo()
  })
</script>
