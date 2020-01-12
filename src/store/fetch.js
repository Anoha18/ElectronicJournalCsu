const req = (url, data) => {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin',
    body: JSON.stringify(data)
  }).then((res) => {
    if (!res.ok) {
      throw new Error('Response returned code error: ', res.status);
    }
  
    const contentType = res.headers.get('content-type');
  
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    }
    
    return res.text();
  }).catch((error) => error);
};

export {
  req
};
