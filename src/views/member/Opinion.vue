<template>
  <page-header-wrapper>
    <a-card border="false">
      <div class="table-page-search-wrapper">
        <a-form layout='inline'>
          <a-row :gutter='48'>
            <a-col :md="8" :sm="24">
              <a-form-item label="会员手机">
                <a-input placeholder="会员手机" v-model="queryParam.mobile"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="反馈类型">
                <a-select v-model="queryParam.opinionType" placeholder="请选择" allowClear>
                  <a-select-option value="0">功能异常</a-select-option>
                  <a-select-option value="1">优化建议</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24" :offset="16">
              <span class="table-page-search-submitButtons" :style="{ float: 'right', overflow: 'hidden' }">
                <a-button type="primary" @click="queryData">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <a-table bordered :data-source="list" :loading="loading" :columns="columns" rowKey="mobile"
               :pagination="pagination">
        <template slot-scope="text,record" slot="img">
          <img :src="record.img" alt="点击放大预览" width="100" height="50" preview="0">
        </template>
        <template slot-scope="text,record" slot="type">
          <a-tag v-if="text === opinionType.malfunction.type" color="#f50">{{opinionType.malfunction.text}}</a-tag>
          <a-tag v-else-if="text === opinionType.optimization.type" color="#108ee9">{{opinionType.optimization.text}}</a-tag>
        </template>
      </a-table>
    </a-card>

  </page-header-wrapper>

</template>

<script>
  import { getOpinionList } from '@/api/member'
  import notification from 'ant-design-vue/lib/notification'
  const opinionType = {
    malfunction : {
      type : "0",
      text : "功能异常"
    },
    optimization : {
      type : "1",
      text : "优化建议"
    }
  }

  export default {
    name: 'Opinion',
    data () {
      return {
        opinionType : opinionType,
        queryParam: {
          mobile: '',
          page: '',
          size: ''
        },
        columns: [
          {
            title: '序号',
            align: 'center',
            customRender: (value, row, index) => {
              return `${(this.pagination.defaultCurrent - 1) * this.pagination.defaultPageSize + index + 1}`
            }
          },
          {
            title: '会员手机号',
            dataIndex: 'mobile',
            align: 'center'
          },
          {
            title: '会员昵称',
            dataIndex: 'nickName',
            align: 'center'
          },
          {
            title: '反馈类型',
            dataIndex: 'opinionType',
            align: 'center',
            scopedSlots: {customRender: "type"}

          },
          {
            title: '反馈内容',
            dataIndex: 'content',
            align: 'center',

          },
          {
            title: '反馈图片',
            dataIndex: 'img',
            align: 'center',
            scopedSlots: {customRender: "img"}
          },

          {
            title: '提交时间',
            dataIndex: 'opinionTime',
            align: 'center'

          },

        ],
        list: [],
        loading: true,

        pagination: {
          defaultCurrent: 1,
          defaultPageSize: 10,
          total: 0,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '30'],
          showTotal: (total) => `共${total}条记录`,
          onShowSizeChange: (current, pageSize) => {
            this.pagination.defaultCurrent = 1
            this.pagination.defaultPageSize = pageSize
            this.queryParam.page = this.pagination.defaultCurrent
            this.queryParam.size = this.pagination.defaultPageSize
            this.getData(this.queryParam)
          },
          onChange: (current, size) => {
            this.pagination.defaultCurrent = current
            this.pagination.defaultPageSize = size
            this.queryParam.page = this.pagination.defaultCurrent
            this.queryParam.size = this.pagination.defaultPageSize
            this.getData(this.queryParam)
          }
        }

      }
    },
    created () {
      this.getData(this.queryParam)
    },
    methods: {
      queryData () {
        this.getData(this.queryParam)
      },
      getData (params) {
        this.loading = true
        getOpinionList(params).then(res => {
          if (res.success) {
            const data = res.data.page
            this.list = data.list
            this.pagination.defaultCurrent= data.currPage
             this.pagination.defaultPageSize = data.pageSize
            this.pagination.total = data.totalCount
          } else {
            notification.error({
              message: '错误',
              description: res.msg
            })
          }
        })
        this.loading = false
      }
    }
  }
</script>

<style scoped>

</style>