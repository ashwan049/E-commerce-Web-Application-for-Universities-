import React, { useEffect, useState } from "react";
import Header from "../../components/Header.js";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance.js";
import { address } from "../../App.js";
import toastr from "toastr";
import swal from "sweetalert";

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

function Product() {
  const query = useQuery();
  const [products, setProducts] = useState(null);
  const [productId, setProductId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    images: [],
    departmentId: query.get("id"),
    price: "",
    description: "",
    quantity: 10,
  });
  const [formError, setFormError] = useState({
    name: "",
    image: "",
    price: "",
    description: "",
    quantity: "",
  });

  const [preview, setPreview] = useState([]);

  useEffect(() => {
    getProducts();
  }, []);

  function getProducts() {
    try {
      axios.get(address(`products/${query.get("id")}`)).then((d) => {
        setProducts(d.data);
      });
    } catch (error) {
      alert(error.message);
    }
  }

  const changeHandler = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const imagehandler = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreview(newPreviews);
      setForm((prevForm) => ({
        ...prevForm,
        images: files, // This is the crucial change
      }));
    } else {
      // Handle case where file is deselected
      setPreview([]);
      setForm((prevForm) => ({
        ...prevForm,
        images: [],
      }));
    }
  };

  function resetForm() {
    setForm({ name: "", images: [], price: "", description: "", quantity: "10" });
  }

  function handleClick() {
    let errors = false;
    let error = { name: "", image: "" };
    if (form.name.trim().length === 0) {
      errors = true;
      error = { ...error, name: "Product name must be there" };
    }
    if (form.images.length === 0 && !productId) {
      errors = true;
      error = { ...error, image: "Image Must be uploaded" };
    }
    if (form.price.trim().length === 0) {
      errors = true;
      error = { ...error, price: "Product price must be there" };
    }
    if (form.description.trim().length === 0) {
      errors = true;
      error = { ...error, description: "Product description must be there" };
    }
    if (form.quantity.trim().length === 0) {
      errors = true;
      error = { ...error, quantity: "Product quantity must be there" };
    }
    setFormError(error);

    if (!errors) productId ? updateProduct() : saveProduct();
  }

  // function saveProduct() {
  //   try {
  //     let formData = new FormData();
  //     formData.append("name", form.name);
  //     form.images.forEach((image, index) => {
  //       formData.append(`images`, image, image.name); // Use 'images' as the field name
  //     });
  //     formData.append("departmentId", query.get("id"))

  //     axios
  //       .post(address("department"), formData, {
  //         "content-type": "multipart/form-data",
  //       })
  //       .then((d) => {
  //         toastr.success(d.data.message);
  //         getProducts();
  //         resetForm();
  //       });
  //   } catch (error) {
  //     toastr.error(error.message);
  //     console.error(error);
  //   }
  // }

  // client/src/container/admin/product.js
  function saveProduct() {
    try {
      let formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("quantity", form.quantity);
      formData.append("departmentId", form.departmentId);

      form.images.forEach((image, index) => {
        formData.append(`images`, image, image.name);
      });

      axios
        .post(address("product"), formData, {
          "content-type": "multipart/form-data",
        })
        .then((d) => {
          toastr.success(d.data.message);
          getProducts();
          resetForm();
          setPreview([]);
        });
    } catch (error) {
      toastr.error(error.message);
      console.error(error);
    }
  }

  function updateProduct() {
    try {
      axios
        .putForm(address("product"), {
          name: form.name,
          images: form.images,
          id: productId,
          description: form.description,
          price: form.price,
          quantity: form.quantity,
        })
        .then((d) => {
          toastr.success(d.data.message);
          getProducts();
          resetForm();
        });
    } catch (error) {
      toastr.error(error?.message);
    }
  }

  function deleteProduct(id) {
    try {
      swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((willDelete) => {
        if (willDelete) {
          axios.delete(address(`product/${id}`)).then((d) => {
            toastr.success(d.data.message);
            getProducts();
          });
        } else {
          swal("Your record is safe!");
        }
      });
    } catch (error) {
      toastr.error(error?.message);
    }
  }

  function renderProducts() {
    return products?.map((item) => {
      return (
        <tr className="text-center">
          <td>
            <img
              src={address(item.images[0])}
              className="image-fluid img-thumbnail"
              width={100}
            />
          </td>
          <td>{item.name}</td>
          <td>{item.description}</td>
          <td>${item.price}</td>
          <td>{item.quantity}</td>

          <td>
            <button
              className="btn btn-success"
              onClick={() => {
                setProductId(item._id);
                setForm({ ...form, name: item.name });

                if (item.images && item.images.length > 0) {
                  const existingPreviews = item.images.map((img) =>
                    address(img)
                  );
                  setPreview(existingPreviews);
                } else {
                  setPreview([]); // No existing images
                }
              }}
            >
              <i className="fa fa-edit"></i>
            </button>
          </td>
          <td>
            <button
              className="btn btn-danger"
              onClick={() => {
                deleteProduct(item._id);
              }}
            >
              <i className="fa fa-trash"></i>
            </button>
          </td>
        </tr>
      );
    });
  }

  return (
    <>
      <Header />

      <div className="bg-light d-flex">
        <div className="card shadow col-5 offset-1">
          <div className="card-header bg-secondary text-white">
            <b className="">{productId ? "Update Product" : "Add Product"}</b>
          </div>
          <div className="card-body">
            <div className="form-group row">
              <label className="font-weight-bold">Department Name</label>
              <b className="form-control">{query.get("name")}</b>
            </div>

            <div className="row">
              <div className="form-group col-6">
                <label className="font-weight-bold ">Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  onChange={changeHandler}
                  value={form.name}
                />
                <p className="text-danger">{formError.name}</p>
              </div>

              <div className="form-group col-6">
                <label className="font-weight-bold">Price</label>
                <input
                  className="form-control"
                  type="text"
                  onChange={changeHandler}
                  value={form.price}
                  name="price"
                />
                <p className="text-danger">{formError.price}</p>
              </div>
            </div>
            <div className="row">
              <div className="col-6">
                <div className="form-group">
                  <label className="font-weight-bold">Quantity</label>
                  <input
                    className="form-control"
                    type="text"
                    onChange={changeHandler}
                    value={form.quantity}
                    name="quantity"
                  />
                  <p className="text-danger">{formError.quantity}</p>
                </div>

                <div className="form-group row">
                  <label className="font-weight-bold ">Product Image</label>
                  <input
                    type="file"
                    className="form-control"
                    name="images"
                    onChange={(e) => {
                      imagehandler(e);
                    }}
                    multiple
                  />
                  <p className="text-danger">{formError.image}</p>
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <label className="font-weight-bold">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={form.description}
                    onChange={changeHandler}
                  ></textarea>
                  <p className="text-danger">{formError.description}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card-footer text-right">
            <button
              className="btn btn-info"
              onClick={() => {
                handleClick();
              }}
            >
              {productId ? "Update" : "Save"}
            </button>
            <button
              className="btn btn-danger mx-2"
              onClick={() => {
                resetForm();
                setProductId(null);
                setPreview([]);
              }}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="text-center mx-auto">
          <div className="d-flex flex-wrap text-center mx-auto">
            {" "}
            {/* Use flexbox to display images */}
            {preview.map((imgSrc, index) => (
              <img
                key={index} // Unique key for each image
                src={imgSrc}
                className="col-6 cover image-fluid m-1" // Add margin for spacing
                alt={`Product preview ${index + 1}`}
                style={{
                  maxWidth: "150px",
                  maxHeight: "150px",
                  objectFit: "cover",
                }} // Adjust size as needed
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 my-5">
        <table className="table table-striped  table-hover table-bordered">
          <thead className="bg-secondary text-white text-center">
            <tr>
              <th>Product Image</th>
              <th>Product Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>{renderProducts()}</tbody>
        </table>
      </div>
    </>
  );
}

export default Product;
