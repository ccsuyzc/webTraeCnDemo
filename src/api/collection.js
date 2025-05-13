import axios from 'axios';
import { BASE_URL } from './config';

// 检查用户是否收藏了文章
export function checkFavoriteStatus(userId, articleId) {
  return axios({
    url: `${BASE_URL}/articles/isfavorite/${userId}/favorite-status/${articleId}`,
    method: 'get',
  });
}

// 收藏文章
export function favoriteArticle(userId, articleId) {
  return axios({
    url: `${BASE_URL}/articles/favorite`,
    method: 'post',
    data: {
      user_id: userId,
      article_id: articleId,
    },
  });
}

// 取消收藏文章
export function unfavoriteArticle(userId, articleId) {
  return axios({
    url: `${BASE_URL}/articles/unfavorite`,
    method: 'post',
    data: {
      user_id: userId,
      article_id: articleId,
    },
  });
}