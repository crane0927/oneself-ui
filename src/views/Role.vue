<template>
  <MainLayout>
    <div class="role-container">
      <main class="role-main">
        <!-- 搜索栏 -->
        <el-card class="search-card" shadow="never">
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item label="角色编码">
              <el-input
                v-model="searchForm.roleCode"
                placeholder="请输入角色编码"
                clearable
                @keyup.enter="handleSearch"
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="角色名称">
              <el-input
                v-model="searchForm.roleName"
                placeholder="请输入角色名称"
                clearable
                @keyup.enter="handleSearch"
                style="width: 200px"
              />
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
              <el-button type="primary" @click="handleAdd" :icon="Plus">新增角色</el-button>
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

        <!-- 角色列表 -->
        <el-card class="table-card" shadow="never">
          <el-table
            v-loading="loading"
            :data="roleList"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="roleCode" label="角色编码" min-width="150" />
            <el-table-column prop="roleName" label="角色名称" min-width="150" />
            <el-table-column prop="description" label="角色描述" min-width="200" show-overflow-tooltip />
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
        :title="dialogMode === 'add' ? '新增角色' : '编辑角色'"
        width="600px"
        @close="handleDialogClose"
      >
        <el-form
          :model="formData"
          :rules="formRules"
          ref="formRef"
          label-width="100px"
        >
          <el-form-item label="角色编码" prop="roleCode">
            <el-input
              v-model="formData.roleCode"
              placeholder="请输入角色编码"
              clearable
              :disabled="dialogMode === 'edit'"
            />
          </el-form-item>
          <el-form-item label="角色名称" prop="roleName">
            <el-input
              v-model="formData.roleName"
              placeholder="请输入角色名称"
              clearable
            />
          </el-form-item>
          <el-form-item label="角色描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入角色描述"
              clearable
            />
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
import { roleApi } from '../api/index.js'
import MainLayout from '../components/MainLayout.vue'

const formRef = ref(null)

// 数据
const loading = ref(false)
const roleList = ref([])
const selectedIds = ref([])
const showDialog = ref(false)
const dialogMode = ref('add') // 'add' | 'edit'

// 表单验证规则
const formRules = {
  roleCode: [
    { required: true, message: '请输入角色编码', trigger: 'blur' }
  ],
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
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
  roleCode: '',
  roleName: '',
  status: ''
})

// 表单数据
const formData = reactive({
  id: '',
  roleCode: '',
  roleName: '',
  description: '',
  status: 'NORMAL'
})

// 加载角色列表
async function loadRoleList() {
  loading.value = true
  try {
    // 构建查询条件
    const condition = {}
    if (searchForm.roleCode) {
      condition.roleCode = searchForm.roleCode
    }
    if (searchForm.roleName) {
      condition.roleName = searchForm.roleName
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

    const response = await roleApi.getPage(params)
    
    console.log('角色列表响应数据:', response)
    
    // 处理响应数据
    if (response && response.data && response.data.records) {
      roleList.value = JSON.parse(JSON.stringify(response.data.records))
      pagination.total = response.data.total || 0
      pagination.pages = response.data.pages || 0
      pagination.pageSize = response.data.pageSize || 20
    } else {
      console.warn('响应数据格式不正确:', response)
      roleList.value = []
      pagination.total = 0
      pagination.pages = 0
    }
  } catch (error) {
    console.error('加载角色列表失败:', error)
    ElMessage.error('加载角色列表失败：' + (error.message || '未知错误'))
    roleList.value = []
  } finally {
    loading.value = false
  }
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
  loadRoleList()
}

// 重置搜索
function handleReset() {
  searchForm.roleCode = ''
  searchForm.roleName = ''
  searchForm.status = ''
  handleSearch()
}

// 每页数量改变
function handlePageSizeChange() {
  pagination.pageNum = 1
  loadRoleList()
}

// 分页切换
function handlePageChange(pageNum) {
  pagination.pageNum = pageNum
  loadRoleList()
}

// 表格选择变化
function handleSelectionChange(selection) {
  selectedIds.value = selection.map(item => item.id)
}

// 新增
function handleAdd() {
  dialogMode.value = 'add'
  resetFormData()
  showDialog.value = true
}

// 编辑
function handleEdit(role) {
  console.log('编辑角色数据:', role)
  
  dialogMode.value = 'edit'
  formData.id = role.id
  formData.roleCode = role.roleCode || ''
  formData.roleName = role.roleName || ''
  formData.description = role.description || ''
  formData.status = role.status || 'NORMAL'
  
  console.log('设置后的表单数据:', formData)
  
  showDialog.value = true
}

// 重置表单数据
function resetFormData() {
  formData.id = ''
  formData.roleCode = ''
  formData.roleName = ''
  formData.description = ''
  formData.status = 'NORMAL'
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    const data = {
      roleCode: formData.roleCode,
      roleName: formData.roleName,
      description: formData.description || undefined,
      status: formData.status
    }

    if (dialogMode.value === 'add') {
      await roleApi.create(data)
      ElMessage.success('新增成功')
    } else {
      await roleApi.update(formData.id, data)
      ElMessage.success('修改成功')
    }

    handleDialogClose()
    loadRoleList()
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
async function handleDelete(role) {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色"${role.roleName}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await roleApi.delete([role.id])
    ElMessage.success('删除成功')
    loadRoleList()
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
    ElMessage.warning('请选择要删除的角色')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个角色吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await roleApi.delete(selectedIds.value)
    ElMessage.success('删除成功')
    selectedIds.value = []
    loadRoleList()
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('批量删除失败:', error)
    ElMessage.error('批量删除失败：' + (error.message || '未知错误'))
  }
}

// 切换状态
async function handleToggleStatus(role) {
  const newStatus = role.status === 'NORMAL' ? 'LOCKED' : 'NORMAL'
  const action = newStatus === 'NORMAL' ? '启用' : '锁定'

  try {
    await ElMessageBox.confirm(
      `确定要${action}角色"${role.roleName}"吗？`,
      '状态确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await roleApi.updateStatus(newStatus, [role.id])
    ElMessage.success(`${action}成功`)
    loadRoleList()
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
  await loadRoleList()
})
</script>

<style scoped>
.role-container {
  height: 100%;
}

.role-main {
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
  .role-container {
    padding: 10px;
  }
}
</style>

