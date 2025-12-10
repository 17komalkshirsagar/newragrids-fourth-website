// // import { createSlice } from "@reduxjs/toolkit";
// // import { associatesApi } from "../../associates.api";

// // const getStoredUser = () => {
// //   try {
// //     const saved = localStorage.getItem("AssociatePartnerAuth");
// //     if (!saved || saved === "undefined") return null;
// //     return JSON.parse(saved);
// //   } catch (err) {
// //     console.error("LOCAL STORAGE PARSE ERROR:", err);
// //     return null;
// //   }
// // };

// // const initialState = {
// //   user: getStoredUser() || null,
// //   role: getStoredUser()?.role || "",
// //   token: getStoredUser()?.token || null,
// //   sessionExpiredOpen: false,
// // };

// // const associatePartnerSlice = createSlice({
// //   name: "associatePartnerSlice",
// //   initialState,

// //   reducers: {
// //     logout: (state) => {
// //       state.user = null;
// //       state.role = "";
// //       state.token = null;
// //       localStorage.removeItem("AssociatePartnerAuth");
// //     },

// //     openSessionExpiredModal: (state) => {
// //       state.sessionExpiredOpen = true;
// //     },

// //     closeSessionExpiredModal: (state) => {
// //       state.sessionExpiredOpen = false;
// //     },
// //   },

// //   extraReducers: (builder) => {
// //     builder

// //       // -----------------------------------------------------
// //       // ⭐ ASSOCIATE LOGIN (your response is FLAT object)
// //       // -----------------------------------------------------
// //       .addMatcher(
// //         associatesApi.endpoints.associateLogin.matchFulfilled,
// //         (state, { payload }) => {
// //           const userData = {
// //             ...payload,             // ⭐ Because payload.user does NOT exist
// //             role: "associate",       // override
// //             token: payload.token || null,
// //           };

// //           state.user = userData;
// //           state.role = "associate";
// //           state.token = payload.token || null;

// //           localStorage.setItem("AssociatePartnerAuth", JSON.stringify(userData));
// //         }
// //       )

// //       // -----------------------------------------------------
// //       // ⭐ ASSOCIATE REGISTER
// //       // -----------------------------------------------------
// //       .addMatcher(
// //         associatesApi.endpoints.associateRegister.matchFulfilled,
// //         (state, { payload }) => {
// //           const userData = {
// //             ...payload,
// //             role: "associate",
// //             token: payload.token || null,
// //           };

// //           state.user = userData;
// //           state.role = "associate";
// //           state.token = payload.token || null;

// //           localStorage.setItem("AssociatePartnerAuth", JSON.stringify(userData));
// //         }
// //       )

// //       // -----------------------------------------------------
// //       // ⭐ PARTNER LOGIN
// //       // -----------------------------------------------------
// //       .addMatcher(
// //         associatesApi.endpoints.partnerLogin.matchFulfilled,
// //         (state, { payload }) => {
// //           const userData = {
// //             ...payload,
// //             role: "partner",
// //             token: payload.token || null,
// //           };

// //           state.user = userData;
// //           state.role = "partner";
// //           state.token = payload.token || null;

// //           localStorage.setItem("AssociatePartnerAuth", JSON.stringify(userData));
// //         }
// //       )

// //       // -----------------------------------------------------
// //       // ⭐ PARTNER REGISTER
// //       // -----------------------------------------------------
// //       .addMatcher(
// //         associatesApi.endpoints.partnerRegister.matchFulfilled,
// //         (state, { payload }) => {
// //           const userData = {
// //             ...payload,
// //             role: "partner",
// //             token: payload.token || null,
// //           };

// //           state.user = userData;
// //           state.role = "partner";
// //           state.token = payload.token || null;

// //           localStorage.setItem("AssociatePartnerAuth", JSON.stringify(userData));
// //         }
// //       )

// //       // -----------------------------------------------------
// //       // ⭐ LOGOUT BOTH
// //       // -----------------------------------------------------
// //       .addMatcher(associatesApi.endpoints.associateLogout.matchFulfilled, (state) => {
// //         state.user = null;
// //         state.role = "";
// //         state.token = null;
// //         localStorage.removeItem("AssociatePartnerAuth");
// //       })

// //       .addMatcher(associatesApi.endpoints.partnerLogout.matchFulfilled, (state) => {
// //         state.user = null;
// //         state.role = "";
// //         state.token = null;
// //         localStorage.removeItem("AssociatePartnerAuth");
// //       });
// //   },
// // });

// // export const {
// //   logout,
// //   openSessionExpiredModal,
// //   closeSessionExpiredModal,
// // } = associatePartnerSlice.actions;

// // export default associatePartnerSlice.reducer;


// import { createSlice } from "@reduxjs/toolkit";
// import { associatesApi } from "../../associates.api";

// const getStoredUser = () => {
//   try {
//     const saved = localStorage.getItem("AssociatePartnerAuth");
//     if (!saved || saved === "undefined") return null;
//     return JSON.parse(saved);
//   } catch (err) {
//     console.error("LOCAL STORAGE PARSE ERROR:", err);
//     return null;
//   }
// };

// const initialState = {
//   user: getStoredUser() || null,
//   role: getStoredUser()?.role || "",
//   token: getStoredUser()?.token || null,
//   sessionExpiredOpen: false,
// };

// const associatePartnerSlice = createSlice({
//   name: "associatePartnerSlice",
//   initialState,

//   reducers: {
//     logout: (state) => {
//       state.user = null;
//       state.role = "";
//       state.token = null;
//       localStorage.removeItem("AssociatePartnerAuth");
//     },

//     openSessionExpiredModal: (state) => {
//       state.sessionExpiredOpen = true;
//     },

//     closeSessionExpiredModal: (state) => {
//       state.sessionExpiredOpen = false;
//     },
//   },

//   extraReducers: (builder) => {
//     builder

//       // -----------------------------------------------------
//       // ⭐ ASSOCIATE LOGIN (your response is FLAT object)
//       // -----------------------------------------------------
//       .addMatcher(
//         associatesApi.endpoints.associateLogin.matchFulfilled,
//         (state, { payload }) => {
//           const userData = {
//             ...payload,             // ⭐ Because payload.user does NOT exist
//             role: "associate",       // override
//             token: payload.token || null,
//           };

//           state.user = userData;
//           state.role = "associate";
//           state.token = payload.token || null;

//           localStorage.setItem("AssociatePartnerAuth", JSON.stringify(userData));
//         }
//       )

//       // -----------------------------------------------------
//       // ⭐ ASSOCIATE REGISTER
//       // -----------------------------------------------------
//       .addMatcher(
//         associatesApi.endpoints.associateRegister.matchFulfilled,
//         (state, { payload }) => {
//           const userData = {
//             ...payload,
//             role: "associate",
//             token: payload.token || null,
//           };

//           state.user = userData;
//           state.role = "associate";
//           state.token = payload.token || null;

//           localStorage.setItem("AssociatePartnerAuth", JSON.stringify(userData));
//         }
//       )

//       // -----------------------------------------------------
//       // ⭐ PARTNER LOGIN  <-- FIXED: now stores payload.user (contains _id)
//       // -----------------------------------------------------
//       .addMatcher(
//         associatesApi.endpoints.partnerLogin.matchFulfilled,
//         (state, { payload }) => {
//           const userData = {
//            ...payload.partner,           // <-- changed to payload.user
//             role: "partner",
//             token: payload.token || null,
//           };

//           state.user = userData;
//           state.role = "partner";
//           state.token = payload.token || null;

//           localStorage.setItem("AssociatePartnerAuth", JSON.stringify(userData));
//         }
//       )

//       // -----------------------------------------------------
//       // ⭐ PARTNER REGISTER  <-- FIXED: now stores payload.user (contains _id)
//       // -----------------------------------------------------
//       .addMatcher(
//         associatesApi.endpoints.partnerRegister.matchFulfilled,
//         (state, { payload }) => {
//           const userData = {
//            ...payload.partner,           // <-- changed to payload.user
//             role: "partner",
//             token: payload.token || null,
//           };

//           state.user = userData;
//           state.role = "partner";
//           state.token = payload.token || null;

//           localStorage.setItem("AssociatePartnerAuth", JSON.stringify(userData));
//         }
//       )

//       // -----------------------------------------------------
//       // ⭐ LOGOUT BOTH
//       // -----------------------------------------------------
//       .addMatcher(associatesApi.endpoints.associateLogout.matchFulfilled, (state) => {
//         state.user = null;
//         state.role = "";
//         state.token = null;
//         localStorage.removeItem("AssociatePartnerAuth");
//       })

//       .addMatcher(associatesApi.endpoints.partnerLogout.matchFulfilled, (state) => {
//         state.user = null;
//         state.role = "";
//         state.token = null;
//         localStorage.removeItem("AssociatePartnerAuth");
//       });
//   },
// });

// export const {
//   logout,
//   openSessionExpiredModal,
//   closeSessionExpiredModal,
// } = associatePartnerSlice.actions;

// export default associatePartnerSlice.reducer;


import { createSlice } from "@reduxjs/toolkit";
import { associatesApi } from "../../associates.api";

const getStoredUser = () => {
  try {
    const saved = localStorage.getItem("AssociatePartnerAuth");
    if (!saved || saved === "undefined") return null;
    return JSON.parse(saved);
  } catch {
    return null;
  }
};

const stored = getStoredUser();

const initialState = {
  user: stored || null,
  role: stored?.role || "",
  token: stored?.token || null,
  sessionExpiredOpen: false,
};

const authSlice = createSlice({
  name: "AssociatePartnerAuth",
  initialState,

  reducers: {
    logout: (state) => {
      state.user = null;
      state.role = "";
      state.token = null;
      localStorage.removeItem("AssociatePartnerAuth");
    },

    openSessionExpiredModal: (state) => {
      state.sessionExpiredOpen = true;
    },

    closeSessionExpiredModal: (state) => {
      state.sessionExpiredOpen = false;
    },
  },

  extraReducers: (builder) => {
    builder

      // ======================================================
      // ⭐ ASSOCIATE LOGIN — CONTROLLER RETURNS:
      // { message, associate, token }
      // ======================================================
      .addMatcher(
        associatesApi.endpoints.associateLogin.matchFulfilled,
        (state, { payload }) => {
          const userData = {
            ...payload.associate,    // <--- controller-based
            token: payload.token,
            role: "associate",
          };

          state.user = userData;
          state.role = "associate";
          state.token = payload.token;

          localStorage.setItem("AssociatePartnerAuth", JSON.stringify(userData));
        }
      )

      // ======================================================
      // ⭐ ASSOCIATE REGISTER — SAME RESPONSE SHAPE
      // ======================================================
      .addMatcher(
        associatesApi.endpoints.associateRegister.matchFulfilled,
        (state, { payload }) => {
          const userData = {
            ...payload.associate,
            token: payload.token,
            role: "associate",
          };

          state.user = userData;
          state.role = "associate";
          state.token = payload.token;

          localStorage.setItem("AssociatePartnerAuth", JSON.stringify(userData));
        }
      )

      // ======================================================
      // ⭐ PARTNER LOGIN — CONTROLLER RETURNS:
      // { message, partner, token }
      // ======================================================
      .addMatcher(
        associatesApi.endpoints.partnerLogin.matchFulfilled,
        (state, { payload }) => {
          const userData = {
            ...payload.partner,      // <--- controller-based (correct)
            token: payload.token,
            role: "partner",
          };

          state.user = userData;
          state.role = "partner";
          state.token = payload.token;

          localStorage.setItem("AssociatePartnerAuth", JSON.stringify(userData));
        }
      )

      // ======================================================
      // ⭐ PARTNER REGISTER
      // ======================================================
      .addMatcher(
        associatesApi.endpoints.partnerRegister.matchFulfilled,
        (state, { payload }) => {
          const userData = {
            ...payload.partner,
            token: payload.token,
            role: "partner",
          };

          state.user = userData;
          state.role = "partner";
          state.token = payload.token;

          localStorage.setItem("AssociatePartnerAuth", JSON.stringify(userData));
        }
      )

      // ======================================================
      // ⭐ ASSOCIATE LOGOUT — backend clears cookie
      // ======================================================
      .addMatcher(
        associatesApi.endpoints.associateLogout.matchFulfilled,
        (state) => {
          state.user = null;
          state.role = "";
          state.token = null;
          localStorage.removeItem("AssociatePartnerAuth");
        }
      )

      // ======================================================
      // ⭐ PARTNER LOGOUT — backend clears cookie
      // ======================================================
      .addMatcher(
        associatesApi.endpoints.partnerLogout.matchFulfilled,
        (state) => {
          state.user = null;
          state.role = "";
          state.token = null;
          localStorage.removeItem("AssociatePartnerAuth");
        }
      );
  },
});

export const {
  logout,
  openSessionExpiredModal,
  closeSessionExpiredModal,
} = authSlice.actions;

export default authSlice.reducer;
