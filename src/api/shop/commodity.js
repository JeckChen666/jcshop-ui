import request from '@/utils/request'

// 查询商品列表
export function listCommodity(query) {
  return request({
    url: '/shop/commodity/list',
    method: 'get',
    params: query
  })
}

// 查询商品详细
export function getCommodity(id) {
  return request({
    url: '/shop/commodity/' + id,
    method: 'get'
  })
}

// 新增商品
export function addCommodity(data) {
  return request({
    url: '/shop/commodity',
    method: 'post',
    data: data
  })
}

// 修改商品
export function updateCommodity(data) {
  return request({
    url: '/shop/commodity',
    method: 'put',
    data: data
  })
}

// 删除商品
export function delCommodity(id) {
  return request({
    url: '/shop/commodity/' + id,
    method: 'delete'
  })
}
