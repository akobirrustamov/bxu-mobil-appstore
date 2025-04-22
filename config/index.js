import axios from "axios";
export let baseUrl;
baseUrl ="http://localhost:8080";
// baseUrl ="https://buxpxti.uz";
// baseUrl ="";
export default function (url, method, data, param) {
    let token = localStorage.getItem("access_token");
    return axios({
        url:  baseUrl+ url,
        method: method,
        data: data,
        headers: {
            "Authorization": token
        },
        params: param
    }).then((res) => {
        if (res.data) {
            // console.log(res.data)
            return {
                error: false,
                data: res.data
            };
        }
    }).catch((err) => {
        if (err.response.status === 401) {
            if (localStorage.getItem("refresh_token")===null){
                return {
                    error: true,
                    data: err.response.status
                };
            }
            return axios({
                url: `http://localhost:8080/api/v1/auth/refresh?refreshToken=${localStorage.getItem("refresh_token")}`,
                method: "POST"
            }).then((res) => {
                localStorage.setItem("access_token", res.data);
                // Returning the inner promise
                return axios({
                    url: "http://localhost:8080" + url,
                    method: method,
                    data: data,
                    headers: {
                        "Authorization": localStorage.getItem("access_token")
                    }
                }).then((res) => {
                    return {
                        error: false,
                        data: res.data
                    };
                }).catch((err) => {
                    return {
                        error: true,
                        data: err.response.data
                    };
                });
            }).catch((err) => {
                return {
                    error: true,
                    data: err.response.data
                };
            });
        } else {
            return {
                error: true,
                data: err.response.data
            };
        }
    });
}
