<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" :placeholder="$t('table.title')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.server" :placeholder="$t('table.server')" clearable style="width: 120px" class="filter-item">
        <el-tooltip
          v-for="item in serverOptions"
          :content="item.description"
          class="item"
          effect="dark"
          placement="right"
        >
          <el-option :key="item.id" :label="item.name" :value="item.id" />
        </el-tooltip>
      </el-select>
      <el-select v-model="listQuery.status" :placeholder="$t('table.status')" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" :placeholder="$t('table.id_sort')" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" style="margin-left: 10px;" size="meduim" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" size="meduim" type="primary" icon="el-icon-edit-outline" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" size="meduim" type="primary" icon="el-icon-video-play" @click="handleCreate">
        {{ $t('table.runSelected') }}
      </el-button>
      <el-checkbox v-model="showUploader" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        {{ $t('table.uploader') }}
      </el-checkbox>
    </div>
    <!--以下是表格样式编辑-->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      :row-class-name="tableRowClassName"
      @row-click="rowClick"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" align="center" width="50" />
      <el-table-column :label="$t('table.id')" prop="id" sortable="custom" align="center" width="60" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.title')" min-width="80px" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.intro')" min-width="220px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.description }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.server')" min-width="220px" align="center">
        <template slot-scope="{row}">
          <el-select v-model="row.selectedServers" placeholder="选择节点进行测试" collapse-tags multiple width="160px" @change="selectedServer(row) ">
            <el-tooltip v-for="item in row.server" :content="item.description" class="item" effect="dark" placement="right">
              <el-option :key="item.id" :label="item.name" :value="item.id" />
            </el-tooltip>
            <el-option key="all" label="全选/反选" value="all" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.params')" min-width="170px" align="center">
        <template slot-scope="{row}">
          <el-select
            v-model="row.selectedParam"
            :disabled="row.selectedParam==='None'"
            clearable
            filterable
            allow-create
            placeholder="输入自定义参数"
            @change="paramChange(row)"
          >
            <el-option v-for="item in row.params" :key="item" :label="item" :value="item" />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.date')" min-width="155px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.lastExecuteTime }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="showUploader" :label="$t('table.uploader')" min-width="70px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.uploader }}</span>
        </template>
      </el-table-column>
      <!--      <el-table-column :label="$t('table.importance')" width="80px">-->
      <!--        <template slot-scope="{row}">-->
      <!--          <svg-icon v-for="n in +row.importance" :key="n" icon-class="star" class="meta-item__icon" />-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <!--      <el-table-column :label="$t('table.readings')" align="center" width="95">-->
      <!--        <template slot-scope="{row}">-->
      <!--          <span v-if="row.pageviews" class="link-type" @click="handleFetchPv(row.pageviews)">{{ row.pageviews }}</span>-->
      <!--          <span v-else>0</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <el-table-column :label="$t('table.status')" class-name="status-col" min-width="95" align="center">
        <template slot-scope="{row}">
          <el-tag :v-model="row.result" style="cursor:pointer" :type="row.status | statusFilter" effect="light" @click="viewResult(row)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" min-width="210" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button size="small" type="primary" @click="runCommand(row)">
            {{ $t('table.run') }}
          </el-button>
          <el-button type="success" size="small" @click="handleUpdate(row)">
            {{ $t('table.edit') }}
          </el-button>

          <!--          <el-button v-if="row.status!='draft'" size="mini" @click="handleModifyStatus(row,'draft')">-->
          <!--            {{ $t('table.draft') }}-->
          <!--          </el-button>-->
          <el-button v-if="row.status!='deleted'" size="small" type="danger" @click="handleDelete(row,$index)">
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="500px" center>
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="80px" style="width: 400px; margin-left:20px;" size="small">
        <el-form-item :label="$t('table.type')" prop="type">
          <el-select v-model="temp.type" class="filter-item">
            <el-option v-for="item in menuOptions" :key="item.id" :label="item.title" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('table.title')" prop="title">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item :label="$t('table.intro')" prop="intro">
          <el-input v-model="temp.description" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入测试项介绍"/>
        </el-form-item>
        <el-form-item :label="$t('table.server')">
          <el-select v-model="temp.selectedServers" placeholder="选择部署节点" collapse-tags multiple @change="selectedServer(temp)">
            <el-tooltip v-for="item in temp.server" :content="item.description" class="item" effect="dark" placement="right">
              <el-option :key="item.id" :label="item.name" :value="item.id" />
            </el-tooltip>
            <el-option key="all" label="全选/反选" value="all" />
          </el-select>
        </el-form-item>
        <!--        <el-form-item :label="$t('table.importance')">-->
        <!--          <el-rate v-model="temp.importance" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" :max="3" style="margin-top:8px;" />-->
        <!--        </el-form-item>-->
        <el-form-item :label="$t('table.command')">
          <el-input v-model="temp.command" placeholder="请填写执行命令，如：dig,python等" />
        </el-form-item>
        <el-form-item :label="$t('table.params')">
          <el-input v-model="temp.params" placeholder="参数之间使用;分隔，若无参数选项请填写None" />
        </el-form-item>
        <el-form-item :label="$t('table.script')">
          <el-upload class="upload-demo"
                     action="api/item/script/upload/"
                     :data="{'guid': temp.guid}"
                     :file-list="temp.script"
                     :on-change="scriptUpload"
                     :on-success="uploadSuccess"
                     :on-error="uploadError"
                     :before-remove="scriptRemove">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">{{$t('table.upload_tips')}}</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('table.save') }}
        </el-button>
        <el-button @click="dialogFormVisible = false" size="small">
          {{ $t('table.cancel') }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchPv, createArticle } from '@/api/article'
import {fetchItems, queryMenus, queryServers, runItem, updateItem} from '@/api/item'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'


export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        '查看结果': '', // 2
        '运行中': 'success', // 1
        '尚未运行': 'info', // 0
        '失败': 'danger' // -1
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        title: undefined,
        type: undefined,
        sort: undefined,
        menuId: undefined,
        selectedServers: []
      },
      multipleSelection: [],
      serverOptions: [],
      menuOptions: [],
      sortOptions: [{ label: 'ID增序', key: '+id' }, { label: 'ID降序', key: '-id' }],
      statusOptions: [{ label: '成功', key: 2 }, { label: '运行中', key: 1 }, { label: '尚未运行', key: 0 }, { label: '失败', key: -1 }],
      showUploader: false,
      temp: {
        title: '',
        description: '',
        type: '',
        server: undefined,
        selectedServers: undefined,
        params: '',
        script: []
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '添加'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false,
      popoverContent: undefined
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listQuery.menuId = this.$route.query.id
      this.listLoading = true
      fetchItems(this.listQuery).then(response => {
        this.list = response.data.items
        for (let i = 0, len = response.data.items.length; i < len; i++) {
          this.list[i].status = '尚未运行'
          this.list[i].params = String(this.list[i].params).split(';')
          this.list[i].selectedParam = this.list[i].params[0]
          this.serverOptions = this.serverOptions.concat(this.list[i].server)
        }
        this.serverOptions = uniq(this.serverOptions)
        this.total = response.data.total
        setTimeout(() => { this.listLoading = false }, 0.5 * 1000)
      })
      // fetchList(this.listQuery).then(response => {
      //   this.list = response.data.items
      //   this.total = response.data.total
      //
      //   // Just to simulate the time of the request
      //   setTimeout(() => {
      //     this.listLoading = false
      //   }, 1.5 * 1000)
      // })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        title: '',
        status: '尚未运行',
        type: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.params = this.temp.params.join(';')
      if(this.temp.script === '') {
        this.temp.script = []
      } else {
        this.temp.script = [{'name': this.temp.script}]
      }
      this.developedServer(row)
      this.getAllMenus()
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      delete this.temp.status
      delete this.temp.uploader
      delete this.temp.selectedParam
      delete this.temp.lastExecuteTime
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          console.log('当前选择的脚本:', tempData.script)
          if (tempData.script.length > 0){
            const script = tempData.script[0]
            tempData.script = {'name': script.name, 'path': script.response.data}
          }
          delete tempData.server
          updateItem(tempData).then((response) => {
            const data = response.data
            // delete data.type
            data['status'] = '尚未运行'
            data.params = String(data.params).split(';')
            data.selectedParam = data.params[0]
            data.selectedServers = []
            this.serverOptions = this.serverOptions.concat(data.server)
            this.serverOptions = uniq(this.serverOptions)
            const index = this.list.findIndex(v => v.id === data.id)
            this.list.splice(index, 1, data)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            },
            )
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    selectedServer(row) {
      const allServers = row.server.map(item => item.id)
      if (row.selectedServers.indexOf('all') !== -1) {
        if (row.selectedServers.length === allServers.length + 1) {
          row.selectedServers = []
        } else {
          row.selectedServers = allServers
        }
      }
    },
    paramChange(row) {
      this.list.splice(this.list.indexOf(row), 1, row)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    runCommand(row) {
      let query = {}
      query.guid = row.guid
      if (row.selectedServers.length <= 0) {
        this.$message({ message: '请至少选择一个测试节点', type: 'warning' })
        return
      }
      query.position = row.selectedServers.join(',')
      query.param = ''
      if (row.selectedParam !== 'None') {
        query.param = row.selectedParam
      }
      row.status = '运行中'
      this.list.splice(this.list.indexOf(row), 1, row)
      query = JSON.stringify(query)
      runItem(query).then(response => {
        const type = response.type
        if (type === 'success') {
          row.result = response.data
          row.status = '查看结果'
          this.list.splice(this.list.indexOf(row), 1, row)
          this.$message.success(row.title + '完成测试！')
        }
        if (type === 'fail') {
          row.result = response.message
          row.status = '失败'
          this.list.splice(this.list.indexOf(row), 1, row)
          this.$message.error(row.result)
        }
      })
    },
    tableRowClassName(row, rowIndex) {
      row.index = rowIndex
    },
    rowClick(row) {
      const index = row.index
      this.list.forEach((item) => {
      })
      this.$set(this.list, index, row)
    },
    viewResult(row) {
      switch (row.status) {
        case '尚未运行':
          this.$message({ message: '请先执行测试项', type: 'warning' })
          return
        case '运行中':
          this.$message({ message: '正在运行测试项中，请稍等', type: 'warning' })
          return
        case '查看结果':
          break
        default:
          this.$message.error(row.result)
          return
      }
      const name = []; const result = []
      for (let i = 0; i < row.result.length; i++) {
        name[i] = row.server.filter(item => item.id === Number(row.result[i].id))[0].name
        result[i] = row.result[i].result
      }
      const i = 0
      this.msg(name, result, i)
    },
    msg(name, result, index) {
      let cancelText = '上一项'
      let confirmText = '下一项'
      if (index === 0) { cancelText = '关闭' }
      if (index === name.length - 1) { confirmText = '确定' }
      this.$msgbox({
        title: name[index] + '执行结果',
        message: this.$createElement('span', { style: 'text-align:left;display:inline-block;word-wrap:break-word;white-space:pre-line;' }, result[index]),
        distinguishCancelAndClose: true,
        showCancelButton: true,
        cancelButtonText: cancelText,
        confirmButtonText: confirmText,
        center: true,
        cancelButtonClass: 'el-button el-button--default el-button--small el-button--primary'
      }).then(action => {
        if (index < name.length - 1) {
          this.msg(name, result, index + 1)
        }
      }).catch(action => {
        if (action === 'close') {
          return
        }
        if (index > 0) {
          this.msg(name, result, index - 1)
        }
      })
    },
    developedServer(row) {
      queryServers({ param: 'all' }).then(response => {
        this.temp.server = response.data
        this.temp.selectedServers = row.server.map(item => item.id)
      })
    },
    scriptUpload(file, script) {
      this.temp.script = script.slice(-1)
    },
    uploadSuccess(response, file, fileList) {
      this.temp.script = {'path': response.data, 'name': file.name}
      console.log('上传成功', this.temp.script, file, fileList)
    },
    uploadError(response, file, fileList) {
      console.log('上传失败')
    },
    scriptRemove(file, fileList) {
      this.temp.script = []
      console.log('删除文件：', file, fileList)
    },
    getAllMenus() {
      queryMenus().then(response => {
        this.menuOptions = response.data
      })
    }
  }
}
function uniq(array) {
  const res = new Map()
  return array.filter((a) => !res.has(a.id) && res.set(a.id, 1))
}
</script>
