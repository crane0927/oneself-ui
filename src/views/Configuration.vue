<template>
  <MainLayout>
    <div class="configuration-container">
      <main class="configuration-main">
        <!-- 搜索栏 -->
        <el-card class="search-card" shadow="never">
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item label="配置名称">
              <el-input
                v-model="searchForm.name"
                placeholder="请输入配置名称"
                clearable
                @keyup.enter="handleSearch"
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="参数键">
              <el-input
                v-model="searchForm.paramKey"
                placeholder="请输入参数键"
                clearable
                @keyup.enter="handleSearch"
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="配置类型">
              <el-select v-model="searchForm.type" placeholder="请选择配置类型" clearable style="width: 150px">
                <el-option label="全部" value="" />
                <el-option label="系统参数" value="SYSTEM" />
                <el-option label="业务参数" value="BUSINESS" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch" :icon="Search">查询</el-button>
              <el-button @click="handleReset" :icon="Refresh">重置</el-button>
              <el-button type="primary" @click="handleAdd" :icon="Plus">新增配置</el-button>
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

        <!-- 配置列表 -->
        <el-card class="table-card" shadow="never">
          <el-table
            v-loading="loading"
            :data="configurationList"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="配置名称" min-width="150" />
            <el-table-column prop="paramKey" label="参数键" min-width="200" />
            <el-table-column prop="paramValue" label="参数值" min-width="200" show-overflow-tooltip />
            <el-table-column prop="type" label="配置类型" width="120">
              <template #default="{ row }">
                <el-tag :type="row.type === 'SYSTEM' ? 'warning' : 'success'">
                  {{ row.type === 'SYSTEM' ? '系统参数' : '业务参数' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
            <el-table-column prop="createBy" label="创建人" width="120" />
            <el-table-column label="创建时间" min-width="180">
              <template #default="{ row }">
                {{ formatDate(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleEdit(row)" :icon="Edit">
                  编辑
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
        :title="dialogMode === 'add' ? '新增参数配置' : '编辑参数配置'"
        width="600px"
        @close="handleDialogClose"
      >
        <el-form
          :model="formData"
          :rules="formRules"
          ref="formRef"
          label-width="100px"
        >
          <el-form-item label="配置名称" prop="name">
            <el-input
              v-model="formData.name"
              placeholder="请输入配置名称"
              clearable
            />
          </el-form-item>
          <el-form-item label="参数键" prop="paramKey">
            <el-input
              v-model="formData.paramKey"
              placeholder="请输入参数键"
              clearable
            />
          </el-form-item>
          <el-form-item label="参数值" prop="paramValue">
            <el-input
              v-model="formData.paramValue"
              type="textarea"
              :rows="3"
              placeholder="请输入参数值"
              clearable
            />
          </el-form-item>
          <el-form-item label="配置类型" prop="type">
            <el-radio-group v-model="formData.type">
              <el-radio label="SYSTEM">系统参数</el-radio>
              <el-radio label="BUSINESS">业务参数</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="2"
              placeholder="请输入备注信息"
              clearable
            />
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
  Edit
} from '@element-plus/icons-vue'
import { configurationApi } from '../api/index.js'
import MainLayout from '../components/MainLayout.vue'

const formRef = ref(null)

// 数据
const loading = ref(false)
const configurationList = ref([])
const selectedIds = ref([])
const showDialog = ref(false)
const dialogMode = ref('add') // 'add' | 'edit'

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入配置名称', trigger: 'blur' }
  ],
  paramKey: [
    { required: true, message: '请输入参数键', trigger: 'blur' }
  ],
  paramValue: [
    { required: true, message: '请输入参数值', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择配置类型', trigger: 'change' }
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
  name: '',
  paramKey: '',
  type: ''
})

// 表单数据
const formData = reactive({
  id: '',
  name: '',
  paramKey: '',
  paramValue: '',
  type: 'SYSTEM',
  remark: ''
})

// 加载配置列表
async function loadConfigurationList() {
  loading.value = true
  try {
    // 构建查询条件
    const condition = {}
    if (searchForm.name) {
      condition.name = searchForm.name
    }
    if (searchForm.paramKey) {
      condition.paramKey = searchForm.paramKey
    }
    if (searchForm.type) {
      condition.type = searchForm.type
    }

    const params = {
      condition: condition,
      pagination: {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        sorts: []
      }
    }

    const response = await configurationApi.getPage(params)
    
    console.log('参数配置列表响应数据:', response)
    
    // 处理响应数据
    if (response && response.data && response.data.records) {
      configurationList.value = JSON.parse(JSON.stringify(response.data.records))
      pagination.total = response.data.total || 0
      pagination.pages = response.data.pages || 0
      pagination.pageSize = response.data.pageSize || 20
    } else {
      console.warn('响应数据格式不正确:', response)
      configurationList.value = []
      pagination.total = 0
      pagination.pages = 0
    }
  } catch (error) {
    console.error('加载参数配置列表失败:', error)
    ElMessage.error('加载参数配置列表失败：' + (error.message || '未知错误'))
    configurationList.value = []
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
  loadConfigurationList()
}

// 重置搜索
function handleReset() {
  searchForm.name = ''
  searchForm.paramKey = ''
  searchForm.type = ''
  handleSearch()
}

// 每页数量改变
function handlePageSizeChange() {
  pagination.pageNum = 1
  loadConfigurationList()
}

// 分页切换
function handlePageChange(pageNum) {
  pagination.pageNum = pageNum
  loadConfigurationList()
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
function handleEdit(config) {
  console.log('编辑参数配置数据:', config)
  
  dialogMode.value = 'edit'
  formData.id = config.id
  formData.name = config.name || ''
  formData.paramKey = config.paramKey || ''
  formData.paramValue = config.paramValue || ''
  formData.type = config.type || 'SYSTEM'
  formData.remark = config.remark || ''
  
  console.log('设置后的表单数据:', formData)
  
  showDialog.value = true
}

// 重置表单数据
function resetFormData() {
  formData.id = ''
  formData.name = ''
  formData.paramKey = ''
  formData.paramValue = ''
  formData.type = 'SYSTEM'
  formData.remark = ''
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    const data = {
      name: formData.name,
      paramKey: formData.paramKey,
      paramValue: formData.paramValue,
      type: formData.type,
      remark: formData.remark || ''
    }

    if (dialogMode.value === 'add') {
      await configurationApi.create(data)
      ElMessage.success('新增成功')
    } else {
      await configurationApi.update(formData.id, data)
      ElMessage.success('修改成功')
    }

    handleDialogClose()
    loadConfigurationList()
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
async function handleDelete(config) {
  try {
    await ElMessageBox.confirm(
      `确定要删除配置"${config.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await configurationApi.delete([config.id])
    ElMessage.success('删除成功')
    loadConfigurationList()
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
    ElMessage.warning('请选择要删除的配置')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个配置吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await configurationApi.delete(selectedIds.value)
    ElMessage.success('删除成功')
    selectedIds.value = []
    loadConfigurationList()
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('批量删除失败:', error)
    ElMessage.error('批量删除失败：' + (error.message || '未知错误'))
  }
}

// 初始化
onMounted(async () => {
  await loadConfigurationList()
})
</script>

<style scoped>
.configuration-container {
  height: 100%;
}

.configuration-main {
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
  .configuration-container {
    padding: 10px;
  }
}
</style>

