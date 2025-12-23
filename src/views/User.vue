<template>
  <MainLayout>
    <div class="user-container">
      <main class="user-main">
        <!-- 搜索栏 -->
        <el-card class="search-card" shadow="never">
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item label="用户名">
              <el-input
                v-model="searchForm.username"
                placeholder="请输入用户名"
                clearable
                @keyup.enter="handleSearch"
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="真实姓名">
              <el-input
                v-model="searchForm.realName"
                placeholder="请输入真实姓名"
                clearable
                @keyup.enter="handleSearch"
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="部门">
              <el-select
                v-model="searchForm.deptId"
                placeholder="请选择部门"
                clearable
                filterable
                style="width: 200px"
              >
                <el-option
                  v-for="dept in allDeptList"
                  :key="dept.id"
                  :label="dept.deptName"
                  :value="dept.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 150px">
                <el-option label="全部" value="" />
                <el-option label="正常" value="NORMAL" />
                <el-option label="锁定" value="LOCKED" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch" :icon="Search">查询</el-button>
              <el-button @click="handleReset" :icon="Refresh">重置</el-button>
              <el-button type="primary" @click="handleAdd" :icon="Plus">新增用户</el-button>
              <el-button 
                type="danger" 
                @click="handleBatchDelete" 
                :disabled="selectedIds.length === 0"
                :icon="Delete"
              >
                批量删除
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 用户列表 -->
        <el-card class="table-card" shadow="never">
          <el-table
            v-loading="loading"
            :data="userList"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="username" label="用户名" min-width="120" />
            <el-table-column prop="realName" label="真实姓名" min-width="100" />
            <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
            <el-table-column prop="phone" label="手机号" width="120" />
            <el-table-column prop="sex" label="性别" width="80">
              <template #default="{ row }">
                <span v-if="row.sex === 'MALE'">男</span>
                <span v-else-if="row.sex === 'FEMALE'">女</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="用户类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.type === 'ADMIN' ? 'warning' : 'info'">
                  {{ row.type === 'ADMIN' ? '管理员' : '普通用户' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="部门" min-width="150">
              <template #default="{ row }">
                {{ getDeptName(row.deptId) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'NORMAL' ? 'success' : 'danger'">
                  {{ row.status === 'NORMAL' ? '正常' : '锁定' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createBy" label="创建人" width="120" />
            <el-table-column label="创建时间" min-width="180">
              <template #default="{ row }">
                {{ formatDate(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleEdit(row)" :icon="Edit">
                  编辑
                </el-button>
                <el-button
                  type="warning"
                  link
                  size="small"
                  @click="handleToggleStatus(row)"
                  :icon="row.status === 'NORMAL' ? LockIcon : UnlockIcon"
                >
                  {{ row.status === 'NORMAL' ? '锁定' : '启用' }}
                </el-button>
                <el-button type="danger" link size="small" @click="handleDelete(row)" :icon="Delete">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 分页 -->
        <el-card class="pagination-card" shadow="never" v-if="pagination.total > 0">
          <el-pagination
            v-model:current-page="pagination.pageNum"
            v-model:page-size="pagination.pageSize"
            :page-sizes="pageSizeOptions"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
          />
        </el-card>
      </main>

      <!-- 新增/编辑弹窗 -->
      <el-dialog
        v-model="showDialog"
        :title="dialogMode === 'add' ? '新增用户' : '编辑用户'"
        width="600px"
        @close="handleDialogClose"
      >
        <el-form
          :model="formData"
          :rules="formRules"
          ref="formRef"
          label-width="100px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="formData.username"
              placeholder="请输入用户名"
              clearable
              :disabled="dialogMode === 'edit'"
            />
          </el-form-item>
          <el-form-item label="真实姓名" prop="realName">
            <el-input
              v-model="formData.realName"
              placeholder="请输入真实姓名"
              clearable
            />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="formData.email"
              placeholder="请输入邮箱"
              clearable
              type="email"
            />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input
              v-model="formData.phone"
              placeholder="请输入手机号"
              clearable
              maxlength="11"
            />
          </el-form-item>
          <el-form-item label="性别" prop="sex">
            <el-radio-group v-model="formData.sex">
              <el-radio label="UNKNOWN">未知</el-radio>
              <el-radio label="MALE">男</el-radio>
              <el-radio label="FEMALE">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="用户类型" prop="type">
            <el-radio-group v-model="formData.type">
              <el-radio label="ADMIN">管理员</el-radio>
              <el-radio label="NORMAL">普通用户</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="所属部门" prop="deptId">
            <el-select
              v-model="formData.deptId"
              placeholder="请选择部门"
              clearable
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="dept in allDeptList"
                :key="dept.id"
                :label="dept.deptName"
                :value="dept.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio label="NORMAL">正常</el-radio>
              <el-radio label="LOCKED">锁定</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Delete,
  Refresh,
  Search,
  Edit,
  Lock as LockIcon,
  Unlock as UnlockIcon
} from '@element-plus/icons-vue'
import { userApi, deptApi } from '../api/index.js'
import MainLayout from '../components/MainLayout.vue'

const formRef = ref(null)

// 数据
const loading = ref(false)
const userList = ref([])
const allDeptList = ref([])
const selectedIds = ref([])
const showDialog = ref(false)
const dialogMode = ref('add') // 'add' | 'edit'

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  sex: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 分页信息
const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0,
  pages: 0
})

// 每页显示数量选项
const pageSizeOptions = [10, 20, 50, 100]

// 搜索表单
const searchForm = reactive({
  username: '',
  realName: '',
  deptId: '',
  status: ''
})

// 表单数据
const formData = reactive({
  id: '',
  username: '',
  email: '',
  phone: '',
  realName: '',
  sex: 'UNKNOWN',
  type: 'NORMAL',
  deptId: '',
  status: 'NORMAL'
})

// 加载用户列表
async function loadUserList() {
  loading.value = true
  try {
    // 构建查询条件
    const condition = {}
    if (searchForm.username) {
      condition.username = searchForm.username
    }
    if (searchForm.realName) {
      condition.realName = searchForm.realName
    }
    if (searchForm.deptId) {
      condition.deptId = searchForm.deptId
    }
    if (searchForm.status) {
      condition.status = searchForm.status
    }

    const params = {
      condition: condition,
      pagination: {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        sorts: []
      }
    }

    const response = await userApi.getPage(params)
    
    console.log('用户列表响应数据:', response)
    
    // 处理响应数据
    if (response && response.data && response.data.records) {
      userList.value = JSON.parse(JSON.stringify(response.data.records))
      pagination.total = response.data.total || 0
      pagination.pages = response.data.pages || 0
      pagination.pageSize = response.data.pageSize || 20
    } else {
      console.warn('响应数据格式不正确:', response)
      userList.value = []
      pagination.total = 0
      pagination.pages = 0
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败：' + (error.message || '未知错误'))
    userList.value = []
  } finally {
    loading.value = false
  }
}

// 将树形结构扁平化
function flattenTree(tree, result = [], level = 0) {
  if (!Array.isArray(tree)) return result
  
  tree.forEach((node) => {
    result.push({
      ...node,
      level: level
    })
    
    // 递归处理子节点
    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
      flattenTree(node.children, result, level + 1)
    }
  })
  
  return result
}

// 加载部门树（用于下拉选择）
async function loadDeptTree() {
  try {
    const response = await deptApi.getTree()
    console.log('部门树响应:', response)
    
    // 处理响应数据
    let treeData = []
    if (response && response.data) {
      if (Array.isArray(response.data)) {
        treeData = response.data
      }
    } else if (Array.isArray(response)) {
      treeData = response
    }
    
    // 扁平化树形结构用于下拉选择
    allDeptList.value = flattenTree(treeData, [], 0)
    
    console.log('扁平化后的部门列表:', allDeptList.value)
    console.log('部门列表数量:', allDeptList.value.length)
  } catch (error) {
    console.error('加载部门树失败:', error)
    // 如果树接口失败，回退到使用列表接口
    await loadDeptListFallback()
  }
}

// 回退方案：使用列表接口（如果树接口失败）
async function loadDeptListFallback() {
  try {
    const response = await deptApi.getAllList()
    console.log('所有部门列表响应（回退）:', response)
    
    if (response && response.data) {
      if (Array.isArray(response.data)) {
        allDeptList.value = JSON.parse(JSON.stringify(response.data))
      } else {
        allDeptList.value = []
      }
    } else if (Array.isArray(response)) {
      allDeptList.value = JSON.parse(JSON.stringify(response))
    } else {
      allDeptList.value = []
    }
  } catch (error) {
    console.error('加载所有部门列表失败:', error)
    allDeptList.value = []
  }
}

// 加载部门列表（用于下拉选择，保持向后兼容）
async function loadDeptList() {
  // 使用树接口加载
  await loadDeptTree()
}

// 获取部门名称
function getDeptName(deptId) {
  if (!deptId) return '-'
  
  const dept = allDeptList.value.find(d => d.id === deptId)
  return dept ? dept.deptName : '-'
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateStr
  }
}

// 搜索
function handleSearch() {
  pagination.pageNum = 1
  loadUserList()
}

// 重置搜索
function handleReset() {
  searchForm.username = ''
  searchForm.realName = ''
  searchForm.deptId = ''
  searchForm.status = ''
  handleSearch()
}

// 每页数量改变
function handlePageSizeChange() {
  pagination.pageNum = 1
  loadUserList()
}

// 分页切换
function handlePageChange(pageNum) {
  pagination.pageNum = pageNum
  loadUserList()
}

// 表格选择变化
function handleSelectionChange(selection) {
  selectedIds.value = selection.map(item => item.id)
}

// 新增
async function handleAdd() {
  dialogMode.value = 'add'
  resetFormData()
  
  // 新增时加载部门树，确保部门列表是最新的
  await loadDeptTree()
  
  showDialog.value = true
}

// 编辑
async function handleEdit(user) {
  console.log('编辑用户数据:', user)
  
  dialogMode.value = 'edit'
  formData.id = user.id
  formData.username = user.username || ''
  formData.email = user.email || ''
  formData.phone = user.phone || ''
  formData.realName = user.realName || ''
  formData.sex = user.sex || 'UNKNOWN'
  formData.type = user.type || 'NORMAL'
  formData.status = user.status || 'NORMAL'
  
  // 编辑时加载部门树，确保部门列表是最新的
  await loadDeptTree()
  
  // 设置部门ID
  if (user.deptId) {
    formData.deptId = user.deptId
  } else {
    formData.deptId = ''
  }
  
  console.log('设置后的表单数据:', formData)
  
  showDialog.value = true
}

// 重置表单数据
function resetFormData() {
  formData.id = ''
  formData.username = ''
  formData.email = ''
  formData.phone = ''
  formData.realName = ''
  formData.sex = 'UNKNOWN'
  formData.type = 'NORMAL'
  formData.deptId = ''
  formData.status = 'NORMAL'
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    const data = {
      username: formData.username,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      realName: formData.realName || undefined,
      sex: formData.sex,
      type: formData.type,
      deptId: formData.deptId || undefined,
      status: formData.status
    }

    if (dialogMode.value === 'add') {
      await userApi.create(data)
      ElMessage.success('新增成功')
    } else {
      await userApi.update(formData.id, data)
      ElMessage.success('修改成功')
    }

    handleDialogClose()
    loadUserList()
  } catch (error) {
    if (error === false) {
      // 表单验证失败
      return
    }
    console.error('保存失败:', error)
    ElMessage.error('保存失败：' + (error.message || '未知错误'))
  }
}

// 关闭弹窗
function handleDialogClose() {
  showDialog.value = false
  resetFormData()
}

// 删除
async function handleDelete(user) {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户"${user.username}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await userApi.delete([user.id])
    ElMessage.success('删除成功')
    loadUserList()
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('删除失败:', error)
    ElMessage.error('删除失败：' + (error.message || '未知错误'))
  }
}

// 批量删除
async function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的用户')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个用户吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await userApi.delete(selectedIds.value)
    ElMessage.success('删除成功')
    selectedIds.value = []
    loadUserList()
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('批量删除失败:', error)
    ElMessage.error('批量删除失败：' + (error.message || '未知错误'))
  }
}

// 切换状态
async function handleToggleStatus(user) {
  const newStatus = user.status === 'NORMAL' ? 'LOCKED' : 'NORMAL'
  const action = newStatus === 'NORMAL' ? '启用' : '锁定'

  try {
    await ElMessageBox.confirm(
      `确定要${action}用户"${user.username}"吗？`,
      '状态确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await userApi.updateStatus(newStatus, [user.id])
    ElMessage.success(`${action}成功`)
    loadUserList()
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('更新状态失败:', error)
    ElMessage.error('更新状态失败：' + (error.message || '未知错误'))
  }
}

// 初始化
onMounted(async () => {
  await loadDeptList()
  await loadUserList()
})
</script>

<style scoped>
.user-container {
  height: 100%;
}

.user-main {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.search-card {
  margin-bottom: 0;
}

.search-form {
  margin: 0;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  flex-wrap: wrap;
  width: 100%;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 12px;
}

.search-form :deep(.el-form-item:last-child) {
  margin-right: 0;
}

.table-card {
  margin-bottom: 0;
}

.pagination-card {
  margin-top: 0;
  display: flex;
  justify-content: flex-end;
}

.pagination-card :deep(.el-card__body) {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
}

.pagination-card :deep(.el-pagination) {
  justify-content: flex-end;
}

/* 响应式 */
@media (max-width: 768px) {
  .user-container {
    padding: 10px;
  }
}
</style>

