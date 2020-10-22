<template>
  <page-header-wrapper>
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="优惠券标题">
              <a-input placeholder="优惠券标题" v-model="queryParam.name" />
            </a-form-item>
          </a-col>

          <a-col :md="8" :sm="24">
            <a-form-item label="优惠券类型">
              <a-select placeholder="请选择" v-model="queryParam.type" allowClear>
                <a-select-option value="0">全品券</a-select-option>
                <a-select-option value="1">类目券</a-select-option>
                <a-select-option value="2">单品券</a-select-option>
                <a-select-option value="2">品牌券</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="优惠券状态">
              <a-select placeholder="请选择" v-model="queryParam.status" allowClear>
                <a-select-option value="0">正常</a-select-option>
                <a-select-option value="1">已过期</a-select-option>
                <a-select-option value="2">已下架</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24" :offset="16">
            <span
              class="table-page-search-submitButtons"
              :style="{ float: 'right', overflow: 'hidden' }"
            >
              <a-button type="primary" icon="plus" @click="addCoupon">添加</a-button>
              <a-button type="primary" style="margin-left: 8px" @click="query">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => {this.queryParam = {}}">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <a-table
      :dataSource="list"
      :loading="loading"
      :columns="columns"
      rowKey="id"
      :pagination="pagination"
    >
      <template slot="min" slot-scope="text,record">
        <span>满{{text}}元可用</span>
      </template>
      <template slot="discount" slot-scope="text,record">
        <span>减免{{text}}元</span>
      </template>
      <template slot="stint" slot-scope="text,record">
        <span>{{text}}张</span>
      </template>
      <template slot="type" slot-scope="text,record">
        <a-tag color="blue" v-if="text==type.all.status">{{type.all.desc}}</a-tag>
        <a-tag color="cyan" v-if="text==type.cate.status">{{type.cate.desc}}</a-tag>
        <a-tag color="green" v-if="text==type.goods.status">{{type.goods.desc}}</a-tag>
        <a-tag color="orange" v-if="text==type.brand.status">{{type.brand.desc}}</a-tag>
      </template>
      <template slot="status" slot-scope="text,record">
        <span v-if="text==0">正常</span>
        <span v-if="text==1">已过期</span>
        <span v-if="text==2">已下架</span>
      </template>
      <template slot="action" slot-scope="text,record">
        <a @click="openDetail(record)">详情</a>
        <a-divider type="vertical" />
        <a @click="editCoupon(record)">编辑</a>
        <a-divider type="vertical" />
        <a @click="deleteCoupon(record.id)">删除</a>
      </template>
    </a-table>
    <a-modal v-model="visiable" title="优惠券详情" width="700" :afterClose="closeModal()" :footer="null">
      <a-descriptions bordered>
        <a-descriptions-item label="名称">{{detail.name}}</a-descriptions-item>
        <a-descriptions-item label="介绍">{{detail.detail}}</a-descriptions-item>
        <a-descriptions-item label="类型">{{detail.type}}</a-descriptions-item>
        <a-descriptions-item label="最低消费">满{{detail.min}}元</a-descriptions-item>
        <a-descriptions-item label="减免金额">{{detail.discount}}元</a-descriptions-item>
        <a-descriptions-item label="每人限制">{{detail.stint}}张</a-descriptions-item>
        <a-descriptions-item label="发放量">
          <span v-if="detail.total==0">不限量</span>
          <span v-else>{{detail.total}}张</span>
        </a-descriptions-item>
        <a-descriptions-item label="当前状态">{{detail.status}}</a-descriptions-item>
        <a-descriptions-item label="有效期">
          <span v-if="detail.days != 0">领取{{detail.days}}天有效</span>
          <span v-else>自{{detail.startTime}}到{{detail.endTime}}</span>
        </a-descriptions-item>
      </a-descriptions>
      <a-card title="可用商品列表">
        <a-list
          class="demo-loadmore-list"
          :loading="loading"
          item-layout="horizontal"
          :data-source="detail.goodsList"
        >
          <div
            v-if="showLoadingMore"
            slot="loadMore"
            :style="{ textAlign: 'center', marginTop: '12px', height: '32px', lineHeight: '32px' }"
          >
            <a-spin v-if="loadingMore" />
            <a-button v-else @click="handleInfiniteOnLoad">加载更多</a-button>
          </div>
          <a-list-item slot="renderItem" slot-scope="item,index">
            <a-list-item-meta :description="item.brief">
              <a slot="title">{{item.title}}</a>
              <a-avatar slot="avatar" :src="item.titleImg" :size="60"></a-avatar>
            </a-list-item-meta>
          </a-list-item>
        </a-list>
      </a-card>
    </a-modal>
    <a-drawer :title="title" :visible="drawVisible" width="700" @close="closeDrawer" destroyOnClose>
      <template>
        <a-form :form="form">
          <a-form-item
            label="优惠券名称"
            required
            has-feedback
            :labelCol="{lg: {span: 7}, sm: {span: 7}}"
            :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
          >
            <a-input
              v-decorator="[
          'name',
          { rules: [{ required: true, message: '请输入优惠券名称' }] },
        ]"
              placeholder="请输入优惠券名称"
            ></a-input>
          </a-form-item>
          <a-form-item
            label="优惠券介绍"
            has-feedback
            required
            :labelCol="{lg: {span: 7}, sm: {span: 7}}"
            :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
          >
            <a-textarea
              v-decorator="[
          'detail',
          { rules: [{ required: true, message: '请输入优惠券介绍' }] },
        ]"
              placeholder="请输入优惠券介绍"
            ></a-textarea>
          </a-form-item>
          <a-form-item
            label="最低消费金额"
            has-feedback
            required
            :labelCol="{lg: {span: 7}, sm: {span: 7}}"
            :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
          >
            <a-input-number
              style="width:120px"
              has-feedback
              :min="1"
              :formatter="value => `￥ ${value}元`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              v-decorator="[
          'min',
          { rules: [{ required: true, message: '必须输入最低消费金额' }] },
        ]"
            ></a-input-number>
          </a-form-item>
          <a-form-item
            label="减免金额"
            required
            has-feedback
            :labelCol="{lg: {span: 7}, sm: {span: 7}}"
            :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
          >
            <a-input-number
              style="width:120px"
              :min="1"
              :formatter="value => `￥ ${value}元`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              v-decorator="[
          'discount',
          { rules: [{ required: true, message: '必须输入减免金额' }] },
        ]"
            ></a-input-number>
          </a-form-item>
          <a-form-item
            label="发放数量"
            has-feedback
            help="如输入0则为无限"
            required
            :labelCol="{lg: {span: 7}, sm: {span: 7}}"
            :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
          >
            <a-input-number
              style="width:120px"
              :min="0"
              v-decorator="[
          'total',
          {initialValue : '0'},
          { rules: [{ required: true, message: '请输入发放数量' }] },
        ]"
            ></a-input-number>
          </a-form-item>
          <a-form-item
          has-feedback
            label="每人领取限制"
            help="如输入0则为无限制"
            required
            :labelCol="{lg: {span: 7}, sm: {span: 7}}"
            :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
          >
            <a-input-number
              style="width:120px"
              :min="0"
              v-decorator="[
          'stint',
          {initialValue : '0'},
          { rules: [{ required: true, message: '请输入领取限制' }] },
        ]"
            ></a-input-number>
          </a-form-item>
          <a-form-item
          has-feedback
            label="有效期"
            required
            :labelCol="{lg: {span: 7}, sm: {span: 7}}"
            :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
          >
            <a-radio-group button-style="solid" v-model="timeType" @change="(e)=>selectTimeType(e)">
              <a-radio-button :value="0">领券相对天数</a-radio-button>
              <a-radio-button :value="1">指定绝对时间</a-radio-button>
            </a-radio-group>
            <a-form-item v-if="timeType==0">
              <a-input-number
                :formatter="value => `${value}天`"
                style="width:220px"
                :min="1"
                v-decorator="[
          'days',
          {initialValue : '1'},
          { rules: [{ required: this.timeType==0, message: '请输入相对天数' }] },
        ]"
              ></a-input-number>
            </a-form-item>
            <a-form-item v-else>
              <!-- <a-range-picker
                v-decorator="[
          'time',
          { rules: [{ required: this.timeType==1, message: '请输入绝对时间' }] },
              ]"-->
              <a-range-picker
                :disabled-date="disabledDate"
                :disabled-time="disabledRangeTime"
                :show-time="{
        hideDisabledOptions: true,
        defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
      }"
                format="YYYY-MM-DD HH:mm:ss"
                v-model="time"
              />
            </a-form-item>
          </a-form-item>
          <a-form-item
            v-if="isEdit"
            label="优惠券状态"
            required
            :labelCol="{lg: {span: 7}, sm: {span: 7}}"
            :wrapperCol="{lg: {span: 17}, sm: {span: 12} }"
          >
            <a-switch
              checked-children="上线"
              un-checked-children="下线"
              v-model="selected"
              size="large"
            ></a-switch>
          </a-form-item>
          <a-form-item
            label="商品限制范围"
            required
            :labelCol="{lg: {span: 7}, sm: {span: 7}}"
            :wrapperCol="{lg: {span: 17}, sm: {span: 12} }"
          >
            <a-radio-group button-style="solid" v-model="selectType">
              <a-radio-button :value="0">全场通用</a-radio-button>
              <a-radio-button :value="1">指定分类</a-radio-button>
              <a-radio-button :value="2">指定商品</a-radio-button>
              <a-radio-button :value="3">指定品牌</a-radio-button>
            </a-radio-group>
            <a-form-item v-if="couponType==1">
              <a-cascader
                style="width: 50%"
                allowClear
                placeholder="请选择分类"
                :fieldNames="fields"
                :options="tree"
                change-on-select
                v-model="categoryIds"
              ></a-cascader>
            </a-form-item>
            <a-form-item v-if="couponType==2">
              <a-select
                v-model="goodsId"
                show-search
                placeholder="输入关键字搜索商品"
                :default-active-first-option="false"
                :filter-option="false"
                :not-found-content="null"
                :show-arrow="false"
                option-label-prop="label"
                @search="(value)=>handleChange(value)"
              >
                <a-select-option
                  v-for="(item,index) in spuList"
                  :key="index"
                  :value="item.id"
                  :label="item.title"
                >
                  <span role="img" :aria-label="item.title">
                    <img :src="item.titleImg" style="width:40px;height:40px" />
                  </span>

                  <span>
                    {{item.title}}
                    <span style="text-align:right">No.{{item.goodsSn}}</span>
                  </span>
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item v-if="couponType==3">
              <a-select
                style="width: 50%"
                showArrow
                showSearch
                option-label-prop="label"
                placeholder="请选择品牌商"
                :filter-option="filterOption"
                option-filter-prop="children"
                v-model="brandId"
              >
                <a-select-option
                  v-for="(item,index) in brands"
                  :key="index"
                  :value="item.id"
                  :label="item.name"
                >
                  <span role="img" :aria-label="item.name">
                    <img :src="item.logo" style="height:30px;width:30px" />
                  </span>
                  {{item.name}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-form-item>
          <a-form-item :wrapperCol="{ span: 24 }" style="text-align: center">
            <a-button htmlType="submit" type="primary" @click="submitForm">提交</a-button>
            <a-button style="margin-left: 8px" type="danger" @click="closeDrawer">取消</a-button>
          </a-form-item>
        </a-form>
      </template>
    </a-drawer>
  </page-header-wrapper>
</template>

<script>
import { couponList, couponDetail, goodsList, addCoupon, updateCoupon,deleteCoupon } from '@/api/coupon'
import { notification } from 'ant-design-vue'
import moment from 'moment'
import { getTree } from '@/api/category'
import { getAllBrand } from '@/api/brand'
import { getSpuList } from '@/api/goods'

export default {
  name: 'Coupon',
  data() {
    return {
      form: this.$form.createForm(this),
      queryParam: {},
      list: [],
      loadingMore: false,
      showLoadingMore: true,
      loading: false,
      visiable: false,
      drawVisible: false,
      timeType: 0,
      selectType: 0,
      time: null,
      couponType: 0,
      detail: {},
      brandId: null,
      goodsId: null,
      categoryIds: [],
      tree: [],
      brands: [],
      couponTypeId : 0,
      couponId : 0,
      spuList: [],
      isEdit: false,
      status: 0,
      type: {
        all: { status: 0, desc: '全品券' },
        cate: { status: 1, desc: '类目券' },
        goods: { status: 2, desc: '单品券' },
        brand: { status: 3, desc: '品牌劵' },
      },
      fields: {
        children: 'children',
        label: 'name',
        key: 'id',
        value: 'id',
      },

      columns: [
        {
          title: '序号',
          align: 'center',
          width: '40px',
          customRender: (value, row, index) => {
            return `${(this.pagination.defaultCurrent - 1) * this.pagination.defaultPageSize + index + 1}`
          },
        },
        {
          title: '标题',
          dataIndex: 'name',
          align: 'center',
        },
        {
          title: '介绍',
          dataIndex: 'detail',
          align: 'center',
        },
        {
          title: '最低消费',
          dataIndex: 'min',
          align: 'center',
          scopedSlots: { customRender: 'min' },
        },
        {
          title: '减免金额',
          dataIndex: 'discount',
          align: 'center',
          scopedSlots: { customRender: 'discount' },
        },
        {
          title: '每人限领',
          dataIndex: 'stint',
          align: 'center',
          scopedSlots: { customRender: 'stint' },
        },
        {
          title: '优惠券类型',
          dataIndex: 'type',
          align: 'center',
          scopedSlots: { customRender: 'type' },
        },
        {
          title: '优惠券状态',
          dataIndex: 'status',
          align: 'center',
          scopedSlots: { customRender: 'status' },
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
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
          this.queryData(this.queryParam)
        },
        onChange: (current, size) => {
          this.pagination.defaultCurrent = current
          this.pagination.defaultPageSize = size
          this.queryParam.page = this.pagination.defaultCurrent
          this.queryParam.size = this.pagination.defaultPageSize
          this.queryData(this.queryParam)
        },
      },
    }
  },
  mounted() {
    this.queryData(this.queryParam)
  },
  computed: {
    title() {
      return this.isEdit ? '编辑优惠券' : '新增优惠券'
    },
    selected: {
      get() {
        return this.status == 0
      },
      set(val) {
        this.status = val ? 0 : 2
      },
    },
  },
  watch: {
    selectType(val) {
      this.couponType = val
      if (this.couponType == 1) {
        getTree().then((res) => {
          if (res.success) {
            this.tree = res.data.tree
          } else {
            this.$message.error(res.msg)
          }
        })
      } else if (this.couponType == 3) {
        getAllBrand().then((res) => {
          if (res.success) {
            this.brands = res.data.list
          } else {
            this.$message.error(res.msg)
          }
        })
      }
    },
  },
  methods: {
    moment,
    query() {
      this.queryData(this.queryParam)
    },
    queryData(params) {
      this.loading = true
      couponList(params).then((res) => {
        if (res.success) {
          this.list = res.data.page.list
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
        this.loading = false
      })
    },
    openDetail(record) {
      this.visiable = true
      couponDetail(record.id).then((res) => {
        if (res.success) {
          this.detail = res.data.detail
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
      })
    },
    handleInfiniteOnLoad() {
      this.loading = true
      const lastGoods = this.detail.goodsList[this.detail.goodsList.length - 1]
      const lastGoodsId = lastGoods.id
      const params = {
        couponId: this.detail.id,
        lastGoodsId: lastGoodsId,
        limit: 5,
      }
      goodsList(params).then((res) => {
        if (res.success) {
          if (res.data.list.length < 1) {
            this.$message.warning('没有更多数据了')
            this.loading = false
            this.showLoadingMore = false
            return
          } else {
            this.detail.goodsList = this.detail.goodsList.concat(res.data.list)
            this.loading = false
            this.$nextTick(() => {
              window.dispatchEvent(new Event('resize'))
            })
          }
        } else {
          this.$message.error(res.msg)
          this.loading = false
        }
      })
    },
    addCoupon() {
      this.drawVisible = true
    },
    closeModal() {
      ;(this.loadingMore = false), (this.showLoadingMore = true)
    },
    selectTimeType(e) {
      const value = e.target.value
      this.timeType = value
    },
    closeDrawer() {
      this.drawVisible = false
      this.brandId = 0
      this.goodsId = 0
      this.categoryIds = []
      this.selectType = 0
      this.couponTypeId = 0
      this.couponId = 0
      this.status = 0
      this.time = []
    },
    filterOption(input, option) {
      return option.componentOptions.children[1].text.indexOf(input) >= 0
    },
    editCoupon(record) {
      this.isEdit = true
      this.drawVisible = true
      this.$nextTick(() => {
        this.form.setFieldsValue({
          name: record.name,
          detail: record.detail,
          min: record.min,
          discount: record.discount,
          total: record.total,
          stint: record.stint,
        })
        this.couponId = record.id
        this.timeType = record.timeType
        this.selectType = record.type
        this.status = record.status
        if (this.timeType == 0) {
          this.form.setFieldsValue({ days: record.days })
        } else {
          let startTime = moment(record.startTime, 'YYYY-MM-DD HH:mm:ss')
          let endTime = moment(record.endTime, 'YYYY-MM-DD HH:mm:ss')
          this.time = [startTime, endTime]
        }
        if (record.couponType) {
            this.couponTypeId = record.couponType.id
        }
        if (record.type === 3) {
          this.brandId = record.couponType.brandId
        } else if (record.type === 1) {
          this.categoryIds = this.findCategoryIds(record.couponType.categoryId)
        } else if (record.type === 2) {
          this.goodsId = record.couponType.goodsId
          getSpuList({ id: this.goodsId }).then((res) => {
            if (res.success) {
              this.spuList = res.data.list.list
            } else {
              this.$message.error(res.msg)
            }
          })
        }
      })
    },
    submitForm() {
      this.form.validateFields((err, values) => {
        if (!err) {
          const param = {}
          param.name = values.name
          param.detail = values.detail
          param.total = values.total
          param.discount = values.discount
          param.min = values.min
          param.stint = values.stint
          param.type = this.couponType
          param.timeType = this.timeType
          param.couponType = {}
          if (this.timeType == 1) {
            param.startTime = this.time[0].format('YYYY-MM-DD HH:mm:ss')
            param.endTime = this.time[1].format('YYYY-MM-DD HH:mm:ss')
          } else {
            param.days = values.days
          }
          if (this.couponType == 1) {
            param.couponType.categoryId = this.categoryIds[this.categoryIds.length - 1]
          } else if (this.couponType == 2) {
            param.couponType.goodsId = this.goodsId
          } else if (this.couponType == 3) {
            param.couponType.brandId = this.brandId
          }
          if (this.isEdit) {
            param.id = this.couponId
            param.status = this.status
            if (this.couponTypeId == 0) {
                param.couponType = {}
            } else {
                param.couponType.id = this.couponTypeId
            }
            updateCoupon(param).then((res) => {
              if (res.success) {
                notification.success({
                  message: '成功',
                  description: '修改优惠券成功',
                })
                this.closeDrawer()
                this.queryData(this.queryParam)
              } else {
                  notification.error({
                message: '失败',
                description: res.msg,
              })
              }
            })
          } else {
            addCoupon(param).then((res) => {
              if (res.success) {
                notification.success({
                  message: '成功',
                  description: '添加优惠券成功',
                })
                this.closeDrawer()
                this.queryData(this.queryParam)
              } else {
                notification.error({
                  message: '失败',
                  description: res.msg,
                })
              }
            })
          }
        }
      })
    },
    handleChange(value) {
      if (value) {
        getSpuList({ name: value }).then((res) => {
          if (res.success) {
            this.spuList = res.data.list.list
          } else {
            this.$message.error(res.msg)
          }
        })
      }
    },
    deleteCoupon(id) {
        const that = this
        this.$confirm({
            title : '是否删除该优惠券，删除后将无法恢复?',
            onOk() {
                deleteCoupon(id).then(res=>{
                    if (res.success) {
                        notification.success({
                            message : "成功",
                            description : "删除优惠券成功"
                        })
                        that.queryData(that.queryParam)
                    } else {
                        notification.error({
                            message : "失败",
                            description : res.msg
                        })
                    }
                })
            }
        })
    },
    range(start, end) {
      const result = []
      for (let i = start; i < end; i++) {
        result.push(i)
      }
      return result
    },

    disabledDate(current) {
      // Can not select days before today and today
      return current && current < moment().endOf('day')
    },

    disabledDateTime() {
      return {
        disabledHours: () => this.range(0, 24).splice(4, 20),
        disabledMinutes: () => this.range(30, 60),
        disabledSeconds: () => [55, 56],
      }
    },

    disabledRangeTime(_, type) {
      if (type === 'start') {
        return {
          disabledHours: () => this.range(0, 60).splice(4, 20),
          disabledMinutes: () => this.range(30, 60),
          disabledSeconds: () => [55, 56],
        }
      }
      return {
        disabledHours: () => this.range(0, 60).splice(20, 4),
        disabledMinutes: () => this.range(0, 31),
        disabledSeconds: () => [55, 56],
      }
    },
    getAllCategorys(arr, all) {
      all.forEach((cate) => {
        arr.push(cate)
        if (cate.children) {
          this.getAllCategorys(arr, cate.children)
        }
      })
    },
    findCategoryIds(categoryId) {
      let arr = []
    
      this.getAllCategorys(arr, this.tree)
      let result = []
      this.getCategoryIds(categoryId, result, arr)
      result.reverse()
      return result
    },
    getCategoryIds(categoryId, arr, categorys) {
      categorys.forEach((cate) => {
        if (cate.id == categoryId) {
          arr.push(cate.id)
          if (cate.parentId != 0) {
            this.getCategoryIds(cate.parentId, arr, categorys)
          }
        }
      })
    },
  },
}
</script>

<style scoped>
.demo-loadmore-list {
  min-height: 350px;
}
</style>