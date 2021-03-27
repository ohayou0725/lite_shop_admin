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
              <a-form-item label="商品编号">
                <a-input placeholder="商品编号" v-model="queryParam.spuSn"/>
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

      <a-table bordered :data-source="list" :loading="loading" :columns="columns" rowKey="id"
               :pagination="pagination">

      </a-table>
    </a-card>

  </page-header-wrapper>

</template>

<script>
  import { getCollectList } from '@/api/member'
  import notification from 'ant-design-vue/lib/notification'

  export default {
    name: 'Collect',
    data () {
      return {
        queryParam: {
          mobile: '',
          spuSn: '',
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
            title: '商品编号',
            dataIndex: 'spuSn',
            align: 'center'
          },
          {
            title: '收藏时间',
            dataIndex: 'joinTime',
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
      this.getData(this.queryParam);
    },
    methods: {
      queryData () {
        this.getData(this.queryParam)
      },
      getData (params) {
        this.loading = true
        getCollectList(params).then(res => {
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