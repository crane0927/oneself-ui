<template>
  <MainLayout>
    <div class="dept-container">
      <main class="dept-main">
      <!-- 搜索栏 -->
      <el-card class="search-card" shadow="never">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="部门名称">
            <el-input
              v-model="searchForm.deptName"
              placeholder="请输入部门名称"
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
            <el-button type="primary" @click="handleAdd" :icon="Plus">新增部门</el-button>
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

      <!-- 部门列表 -->
      <el-card class="table-card" shadow="never">
        <el-table
          v-loading="loading"
          :data="deptList"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="deptName" label="部门名称" min-width="150" />
          <el-table-column label="父部门" min-width="150">
            <template #default="{ row }">
              {{ getParentName(row.parentId) }}
            </template>
          </el-table-column>
          <el-table-column prop="sortOrder" label="排序" width="100">
            <template #default="{ row }">
              {{ row.sortOrder !== null && row.sortOrder !== undefined ? row.sortOrder : '-' }}
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
      :title="dialogMode === 'add' ? '新增部门' : '编辑部门'"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        :model="formData"
        :rules="formRules"
        ref="formRef"
        label-width="100px"
      >
        <el-form-item label="部门名称" prop="deptName">
          <el-input
            v-model="formData.deptName"
            placeholder="请输入部门名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="父部门" prop="parentId">
          <el-select
            v-model="formData.parentId"
            placeholder="请选择父部门"
            clearable
            style="width: 100%"
            filterable
          >
            <el-option label="无（顶级部门）" value="" />
            <el-option
              v-for="dept in allDeptList"
              :key="dept.id"
              :label="dept.simpleName || dept.displayName || dept.deptName"
              :value="String(dept.id)"
              :disabled="dept.id === formData.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number
            v-model="formData.sortOrder"
            :min="0"
            placeholder="请输入排序值"
            style="width: 100%"
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
import { ref, reactive, computed, onMounted } from 'vue'
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
import { deptApi } from '../api/index.js'
import MainLayout from '../components/MainLayout.vue'

const formRef = ref(null)

// 数据
const loading = ref(false)
const deptList = ref([])
const allDeptList = ref([]) // 用于下拉选择父部门（扁平列表）
const deptTreeList = ref([]) // 用于下拉选择父部门（树形结构，带缩进）
const selectedIds = ref([])
const showDialog = ref(false)
const dialogMode = ref('add') // 'add' | 'edit'

// 表单验证规则
const formRules = {
  deptName: [
    { required: true, message: '请输入部门名称', trigger: 'blur' }
  ],
  sortOrder: [
    { required: true, message: '请输入排序值', trigger: 'blur' },
    { type: 'number', min: 0, message: '排序值必须大于等于0', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 分页信息
const pagination = reactive({
  pageNum: 1,
  pageSize: 20, // 默认每页 20 条
  total: 0,
  pages: 0
})

// 每页显示数量选项
const pageSizeOptions = [10, 20, 50, 100]

// 搜索表单
const searchForm = reactive({
  deptName: '',
  status: ''
})

// 表单数据
const formData = reactive({
  id: '',
  deptName: '',
  parentId: '',
  sortOrder: 0,
  status: 'NORMAL'
})


// 加载部门列表
async function loadDeptList() {
  loading.value = true
  try {
    // 构建查询条件
    const condition = {}
    if (searchForm.deptName) {
      condition.deptName = searchForm.deptName
    }
    if (searchForm.status) {
      condition.status = searchForm.status
    }

    const params = {
      condition: condition, // condition 是必填字段，即使为空也要传递对象
      pagination: {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        sorts: []
      }
    }

    const response = await deptApi.getPage(params)
    
    console.log('部门列表响应数据:', response)
    
    // 处理响应数据 - 根据实际接口返回格式
    if (response && response.data && response.data.records) {
      // 确保数据是响应式的，使用深拷贝避免引用问题
      deptList.value = JSON.parse(JSON.stringify(response.data.records))
      pagination.total = response.data.total || 0
      pagination.pages = response.data.pages || 0
      pagination.pageSize = response.data.pageSize || 10
      
      console.log('处理后的部门列表:', deptList.value)
      console.log('第一条数据示例:', deptList.value[0])
      console.log('分页信息:', {
        total: pagination.total,
        pages: pagination.pages,
        pageSize: pagination.pageSize
      })
    } else {
      console.warn('响应数据格式不正确:', response)
      deptList.value = []
      pagination.total = 0
      pagination.pages = 0
    }
  } catch (error) {
    console.error('加载部门列表失败:', error)
    ElMessage.error('加载部门列表失败：' + (error.message || '未知错误'))
    deptList.value = []
  } finally {
    loading.value = false
  }
}

// 将树形结构扁平化，使用清晰的树形显示
function flattenTree(tree, result = [], level = 0, excludeId = null, isLast = false, prefix = '') {
  if (!Array.isArray(tree)) return result
  
  tree.forEach((node, index) => {
    const isLastNode = index === tree.length - 1
    const currentPrefix = level === 0 ? '' : prefix + (isLastNode ? '└─ ' : '├─ ')
    const nextPrefix = level === 0 ? '' : prefix + (isLastNode ? '   ' : '│  ')
    
    // 排除当前编辑的部门（不能选择自己作为父部门）
    if (node.id !== excludeId) {
      result.push({
        ...node,
        level: level,
        displayName: currentPrefix + node.deptName,
        simpleName: '　'.repeat(level) + node.deptName // 使用全角空格作为备选
      })
      
      // 递归处理子节点
      if (node.children && Array.isArray(node.children) && node.children.length > 0) {
        flattenTree(node.children, result, level + 1, excludeId, isLastNode, nextPrefix)
      }
    } else {
      // 如果当前节点是被排除的，仍然需要处理其子节点
      if (node.children && Array.isArray(node.children) && node.children.length > 0) {
        flattenTree(node.children, result, level + 1, excludeId, isLastNode, nextPrefix)
      }
    }
  })
  
  return result
}

// 加载部门树（用于下拉选择和显示父部门名称）
async function loadDeptTree(excludeId = null) {
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
    
    // 保存原始树形结构
    deptTreeList.value = JSON.parse(JSON.stringify(treeData))
    
    // 扁平化树形结构用于下拉选择
    allDeptList.value = flattenTree(treeData, [], 0, excludeId)
    
    console.log('处理后的部门树:', deptTreeList.value)
    console.log('扁平化后的部门列表:', allDeptList.value)
    console.log('部门列表数量:', allDeptList.value.length)
  } catch (error) {
    console.error('加载部门树失败:', error)
    // 如果树接口失败，回退到使用列表接口
    await loadAllDeptListFallback()
  }
}

// 回退方案：使用列表接口（如果树接口失败）
async function loadAllDeptListFallback() {
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

// 加载所有部门（用于显示父部门名称，保持向后兼容）
async function loadAllDeptList() {
  // 使用树接口加载
  await loadDeptTree()
}

// 获取父部门名称
function getParentName(parentId) {
  if (!parentId) return '-'
  
  // 先从当前页的部门列表中查找
  const parentInCurrentPage = deptList.value.find(d => d.id === parentId)
  if (parentInCurrentPage) {
    return parentInCurrentPage.deptName
  }
  
  // 如果当前页没有，从扁平化的部门列表中查找（从树接口获取的）
  const parent = allDeptList.value.find(d => d.id === parentId)
  return parent ? parent.deptName : '-'
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
  loadDeptList()
}

// 重置搜索
function handleReset() {
  searchForm.deptName = ''
  searchForm.status = ''
  handleSearch()
}

// 每页数量改变
function handlePageSizeChange() {
  // 改变每页数量时，重置到第一页
  pagination.pageNum = 1
  loadDeptList()
}

// 分页切换
function handlePageChange(pageNum) {
  pagination.pageNum = pageNum
  loadDeptList()
}

// 表格选择变化
function handleSelectionChange(selection) {
  selectedIds.value = selection.map(item => item.id)
}

// 新增
async function handleAdd() {
  dialogMode.value = 'add'
  resetFormData()
  
  // 加载部门树（新增时不需要排除任何部门）
  await loadDeptTree()
  
  showDialog.value = true
}

// 编辑
async function handleEdit(dept) {
  console.log('编辑部门数据:', dept)
  
  dialogMode.value = 'edit'
  formData.id = dept.id
  formData.deptName = dept.deptName || ''
  // 处理 parentId：如果是 null 或 undefined，设置为空字符串；否则转换为字符串确保类型匹配
  formData.parentId = dept.parentId ? String(dept.parentId) : ''
  formData.sortOrder = dept.sortOrder || 0
  formData.status = dept.status || 'NORMAL'
  
  console.log('设置后的表单数据:', formData)
  
  // 使用树接口加载部门列表，排除当前编辑的部门（不能选择自己作为父部门）
  await loadDeptTree(dept.id)
  
  showDialog.value = true
}

// 重置表单数据
function resetFormData() {
  formData.id = ''
  formData.deptName = ''
  formData.parentId = ''
  formData.sortOrder = 0
  formData.status = 'NORMAL'
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    const data = {
      deptName: formData.deptName,
      parentId: formData.parentId || null,
      sortOrder: formData.sortOrder,
      status: formData.status
    }

    if (dialogMode.value === 'add') {
      await deptApi.create(data)
      ElMessage.success('新增成功')
    } else {
      await deptApi.update(formData.id, data)
      ElMessage.success('修改成功')
    }

    handleDialogClose()
    loadDeptList()
    loadAllDeptList() // 刷新下拉列表
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
async function handleDelete(dept) {
  try {
    await ElMessageBox.confirm(
      `确定要删除部门"${dept.deptName}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await deptApi.delete([dept.id])
    ElMessage.success('删除成功')
    loadDeptList()
    loadAllDeptList()
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
    ElMessage.warning('请选择要删除的部门')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个部门吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await deptApi.delete(selectedIds.value)
    ElMessage.success('删除成功')
    selectedIds.value = []
    loadDeptList()
    loadAllDeptList()
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('批量删除失败:', error)
    ElMessage.error('批量删除失败：' + (error.message || '未知错误'))
  }
}

// 切换状态
async function handleToggleStatus(dept) {
  const newStatus = dept.status === 'NORMAL' ? 'LOCKED' : 'NORMAL'
  const action = newStatus === 'NORMAL' ? '启用' : '锁定'

  try {
    await ElMessageBox.confirm(
      `确定要${action}部门"${dept.deptName}"吗？`,
      '状态确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await deptApi.updateStatus(newStatus, [dept.id])
    ElMessage.success(`${action}成功`)
    loadDeptList()
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
  // 先加载所有部门列表，确保父部门名称能正确显示
  await loadAllDeptList()
  // 然后加载分页列表
  await loadDeptList()
})
</script>

<style scoped>
.dept-container {
  height: 100%;
}

.dept-main {
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
  .dept-container {
    padding: 10px;
  }
}
</style>

