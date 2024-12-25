window.onload = function() {
    showCategory('sandwich');
    highlightCategoryButton('sandwich');
    enableCartDrag();
    };

    function showCategory(category) {
        const categories = document.querySelectorAll(".menu-items");
        categories.forEach((cat) => cat.style.display = "none");

        const selectedCategory = document.getElementById(category);
        if (selectedCategory) selectedCategory.style.display = "flex";

        // 버튼 강조 업데이트
        highlightCategoryButton(category);
    }

    function highlightCategoryButton(category) {
        const buttons = document.querySelectorAll(".categories button");
        buttons.forEach(button => {
            if (button.textContent.includes(
                category === 'sandwich' ? '샌드위치' : 
                category === 'salad' ? '샐러드' : 
                category === 'wrap' ? '시그니처 랩' : 
                '사이드/음료'
            )) {
                button.style.background = '#ffca0a'; // 선택된 버튼은 노란색
            } else {
                button.style.background = '#009948'; // 선택되지 않은 버튼은 초록색
            }
        });
    }

    function allowDrop(event) {
        event.preventDefault();
    }

    function drag(event) {
        event.dataTransfer.setData("id", event.target.dataset.id);
    }

    function dragFromCart(event) {
        const id = event.target.dataset.id;
        event.dataTransfer.setData("cart-id", id);
    }

    function drop(event) {
        event.preventDefault();
        const id = event.dataTransfer.getData("id");
        const cartItems = document.querySelector(".cart-items");
    
        // "주문할 메뉴를 선택해 주세요!" 글자를 제거
        const placeholder = cartItems.querySelector(".kcal");
        if (placeholder) {
            placeholder.remove();
        }
    
        let existingItem = cartItems.querySelector(`[data-id='${id}']`);
        if (existingItem) {
            let quantityElement = existingItem.querySelector(".quantity");
            let quantity = parseInt(quantityElement.innerText, 10);
            quantityElement.innerText = quantity + 1;
        } else {
            const menuItem = document.querySelector(`[data-id='${id}']`);
            const menuItemClone = menuItem.cloneNode(true);
    
            // 메뉴에서 숨기기
            menuItem.style.display = "none";

             // 칼로리 정보 제거
            const kcalElement = menuItemClone.querySelector(".kcal");
            if (kcalElement) {
                kcalElement.remove();
            }
    
            // 장바구니에 추가
            menuItemClone.ondragstart = dragFromCart;
            menuItemClone.style.height = "95px";
            menuItemClone.style.flexShrink = "0";
    
            menuItemClone.innerHTML += `
                <div class="quantity-controls">
                    <button onclick="changeQuantity('${id}', -1)">-</button>
                    <span class="quantity">1</span>
                    <button onclick="changeQuantity('${id}', 1)">+</button>
                </div>
            `;
    
            cartItems.appendChild(menuItemClone);
        }
    
        updateTotal();
    }
    
    function dropToMenu(event) {
        event.preventDefault();
    
        // 드래그한 데이터 ID 가져오기
        const id = event.dataTransfer.getData("cart-id");
        const cartItems = document.querySelector(".cart-items");
        const cartItem = cartItems.querySelector(`[data-id='${id}']`);
    
        // 장바구니에서 항목 삭제
        if (cartItem) {
            cartItem.remove();
    
            // 메뉴에서 다시 표시
            const menuItem = document.querySelector(`[data-id='${id}']`);
            if (menuItem) {
                menuItem.style.display = "flex";
            }
    
            updateTotal(); // 총합 갱신
        }
    }
    
    

    function changeQuantity(id, delta) {
        const cartItems = document.querySelector(".cart-items");
        const item = cartItems.querySelector(`[data-id='${id}']`);
        if (!item) return;
    
        let quantityElement = item.querySelector(".quantity");
        let quantity = parseInt(quantityElement.innerText, 10) + delta;
    
        if (quantity <= 0) {
            // 장바구니에서 항목 제거
            item.remove();
    
            // 메뉴 복구
            const menuItem = document.querySelector(`[data-id='${id}']`);
            if (menuItem) {
                menuItem.style.display = "flex"; // 메뉴 다시 보이기
            }
        } else {
            // 수량 업데이트
            quantityElement.innerText = quantity;
        }
    
        updateTotal(); // 총합 갱신
    }
    

    function updateTotal() {
        const items = document.querySelectorAll(".cart-items .menu-card");
        const checkoutBtn = document.getElementById("checkout-btn");

        let total = 0;
        items.forEach((item) => {
            const price = parseInt(item.getAttribute("data-price"), 10);
            const quantity = parseInt(item.querySelector(".quantity").innerText, 10);
            total += price * quantity;
        });

        // 숫자를 천 단위로 포맷팅
        const formattedTotal = new Intl.NumberFormat('ko-KR').format(total);
        checkoutBtn.innerText = `₩${formattedTotal} 결제하기`;

        // 장바구니 드래그 기능 업데이트
        updateCartDrag();
    }
    
    function clearCart() {
        const cartItems = document.querySelector(".cart-items");
        const cartMenuCards = cartItems.querySelectorAll(".menu-card");
    
        // 장바구니 항목을 원래 메뉴로 복구
        cartMenuCards.forEach((cartItem) => {
            const menuId = cartItem.dataset.id;
            const menuItem = document.querySelector(`[data-id='${menuId}']`);
            if (menuItem) {
                menuItem.style.display = "flex"; // 숨겨진 메뉴를 다시 표시
            }
        });
    
        // 장바구니 초기화
        cartItems.innerHTML = `<p class="kcal">주문할 메뉴를 선택해 주세요!</p>`;
        updateTotal(); // 총합 갱신
    }
    

    function enableCartDrag() {
        const cartItems = document.querySelectorAll(".cart-items .menu-card");
        cartItems.forEach((item) => {
            item.setAttribute("draggable", "true");
            item.ondragstart = dragFromCart;
        });
    }

    function updateCartDrag() {
        enableCartDrag();
    }

    // 메뉴 영역에 드롭 이벤트 추가
    const menuContainer = document.querySelector(".menu-container");
    menuContainer.ondrop = dropToMenu;
    menuContainer.ondragover = allowDrop;

     // "결제하기" 버튼 클릭 시 영수증 모달 표시
    document.getElementById("checkout-btn").addEventListener("click", showReceipt);

    // "취소하기" 버튼 클릭 시 영수증 팝업 닫기
    document.getElementById("cancelReceipt").addEventListener("click", closeReceipt);

    // "결제하기" 버튼 클릭 시 결제 완료 처리
    document.getElementById("confirmReceipt").addEventListener("click", confirmPayment);

    function showReceipt() {
        const receiptModal = document.getElementById("receipt");
        const receiptItemsContainer = document.getElementById("receiptItems");
        const totalPayment = document.getElementById("totalPayment");
        const cartItems = document.querySelectorAll(".cart-items .menu-card");

        // 장바구니가 비어있다면 결제 불가
        if (cartItems.length === 0) {
            alert("장바구니가 비어 있습니다. 메뉴를 추가해주세요!");
            return;
        }

        // 기존 영수증 내용을 초기화
        receiptItemsContainer.innerHTML = "";

        // 장바구니 항목 불러오기
        let total = 0;

        cartItems.forEach((item) => {
            const name = item.querySelector(".name").innerText;
            const quantity = parseInt(item.querySelector(".quantity").innerText, 10);
            const price = parseInt(item.getAttribute("data-price"), 10);
            total += price * quantity;

            // 영수증에 항목 추가
            const receiptItem = document.createElement("div");
            receiptItem.innerHTML = `
                <p>${name} x${quantity} +${new Intl.NumberFormat('ko-KR').format(price * quantity)}</p>
            `;
            receiptItemsContainer.appendChild(receiptItem);
        });

        // 총 결제 금액 표시
        totalPayment.innerText = new Intl.NumberFormat('ko-KR').format(total);

        // 영수증 모달 표시
        receiptModal.style.display = "flex";
    }

    function closeReceipt() {
        const receiptModal = document.getElementById("receipt");
        receiptModal.style.display = "none"; // 영수증 창 닫기
    }
    function confirmPayment() {
        const receiptModal = document.getElementById("receipt");
        const cartItemsContainer = document.querySelector(".cart-items");

        // 결제 완료 알림
        alert("결제가 완료되었습니다!");

        // 영수증 모달 닫기
        receiptModal.style.display = "none";

        // 장바구니 초기화
        cartItemsContainer.innerHTML = `<p class="kcal">주문할 메뉴를 선택해 주세요!</p>`;

        // 총 결제 금액 업데이트
        updateTotal();
    }

    // 관리자 페이지 열기 및 닫기
    const adminModal = document.getElementById("adminPage");
        const managerButton = document.querySelector(".manager_button");
    const closeAdminButton = document.getElementById("closeAdmin");

    managerButton.addEventListener("click", () => {
        adminModal.style.display = "flex";
    });

    closeAdminButton.addEventListener("click", () => {
        adminModal.style.display = "none";
    });

    // 관리자 탭 변경
    function showAdminSection(sectionId) {
        const sections = document.querySelectorAll(".admin-section");
        const tabs = document.querySelectorAll(".admin-tabs button");

        sections.forEach(section => {
            section.classList.remove("active");
        });
        tabs.forEach(tab => {
            tab.classList.remove("active");
        });

        document.getElementById(sectionId).classList.add("active");
        document.querySelector(`.admin-tabs button[onclick="showAdminSection('${sectionId}')"]`).classList.add("active");
    }

    // scripts.js

    // 메뉴 추가 폼 제출 이벤트 처리
    document.getElementById("addMenuForm").addEventListener("submit", function (e) {
        e.preventDefault(); // 기본 폼 제출 방지

    // 입력 값 가져오기
    const menuName = document.getElementById("menuName").value.trim();
    const menuPrice = document.getElementById("menuPrice").value.trim();
    const menuNotes = document.getElementById("menuNotes").value.trim();
    const menuCategory = document.getElementById("menuCategory").value;
    const menuImage = document.getElementById("menuImage").files[0];

    if (!menuName || !menuPrice || !menuNotes || !menuCategory || !menuImage) {
        alert("모든 필드를 입력하세요!");
        return;
    }

    // 이미지 URL 생성
    const imageUrl = URL.createObjectURL(menuImage);

    // 카테고리에 따른 고정된 서식 생성
    let newMenuCardHTML = "";
    switch (menuCategory) {
        case "sandwich":
            newMenuCardHTML = `
                <div class="menu-card sandwich" draggable="true" ondragstart="drag(event)" data-price="${menuPrice}" data-id="menu-${Date.now()}">
                    <div class="menu-img" style="background-image: url('${imageUrl}'); background-size: cover;"></div>
                    <div class="menu-info">
                        <p class="name">${menuName}</p>
                        <p class="kcal">${menuNotes}</p>
                        <p class="price">${parseInt(menuPrice).toLocaleString("ko-KR")}원</p>
                    </div>
                </div>`;
            break;

        case "salad":
            newMenuCardHTML = `
                <div class="menu-card salad" draggable="true" ondragstart="drag(event)" data-price="${menuPrice}" data-id="menu-${Date.now()}">
                    <div class="menu-img" style="background-image: url('${imageUrl}'); background-size: contain; border: 2px solid green;"></div>
                    <div class="menu-info">
                        <p class="name">${menuName}</p>
                        <p class="kcal">${menuNotes}</p>
                        <p class="price">${parseInt(menuPrice).toLocaleString("ko-KR")}원</p>
                    </div>
                </div>`;
            break;

        case "wrap":
            newMenuCardHTML = `
                <div class="menu-card wrap" draggable="true" ondragstart="drag(event)" data-price="${menuPrice}" data-id="menu-${Date.now()}">
                    <div class="menu-img" style="background-image: url('${imageUrl}'); background-size: cover; border-radius: 15px;"></div>
                    <div class="menu-info">
                        <p class="name">${menuName}</p>
                        <p class="kcal">${menuNotes}</p>
                        <p class="price">${parseInt(menuPrice).toLocaleString("ko-KR")}원</p>
                    </div>
                </div>`;
            break;

        case "side":
            newMenuCardHTML = `
                <div class="menu-card side" draggable="true" ondragstart="drag(event)" data-price="${menuPrice}" data-id="menu-${Date.now()}">
                    <div class="menu-img" style="background-image: url('${imageUrl}'); background-size: cover;"></div>
                    <div class="menu-info">
                        <p class="name">${menuName}</p>
                        <p class="kcal">${menuNotes}</p>
                        <p class="price">${parseInt(menuPrice).toLocaleString("ko-KR")}원</p>
                    </div>
                </div>`;
            break;

        default:
            alert("유효하지 않은 카테고리입니다!");
            return;
    }

    // 새로운 메뉴 카드 DOM에 추가
    const categoryContainer = document.getElementById(menuCategory);
    if (categoryContainer) {
        categoryContainer.innerHTML += newMenuCardHTML;
        alert("새 메뉴가 추가되었습니다!");

        loadDeletableMenuList();

        document.getElementById("addMenuForm").reset(); // 폼 초기화
    } else {
        alert("카테고리를 찾을 수 없습니다!");
    }
});
   
// scripts.js

// 초기 로드 시 삭제 가능한 메뉴 리스트를 로드
function loadDeletableMenuList() {
    const menuListContainer = document.getElementById("menuList");
    menuListContainer.innerHTML = ""; // 기존 리스트 초기화

    // 모든 카테고리의 메뉴 가져오기
    const categories = ["sandwich", "salad", "wrap", "side"];
    categories.forEach(categoryId => {
        const categoryElement = document.getElementById(categoryId);
        if (!categoryElement) return;

        // 모든 메뉴 카드 가져오기
        const menuCards = categoryElement.querySelectorAll(".menu-card");

        menuCards.forEach(menuCard => {
            const menuId = menuCard.dataset.id;
            const menuName = menuCard.querySelector(".name").innerText;
            const menuPrice = menuCard.querySelector(".price").innerText;

            // 삭제 리스트에 추가할 메뉴 생성
            const menuItem = document.createElement("div");
            menuItem.className = "deletable-menu-item";
            menuItem.dataset.menuId = menuId;
            menuItem.dataset.categoryId = categoryId;

            menuItem.innerHTML = `
                <span>${menuName} - ${menuPrice}</span>
                <button class="delete-menu-button">삭제</button>
            `;

            // 삭제 버튼 이벤트 추가
            const deleteButton = menuItem.querySelector(".delete-menu-button");
            deleteButton.addEventListener("click", () => {
                deleteMenu(menuId, categoryId);
            });

            // 리스트에 메뉴 추가
            menuListContainer.appendChild(menuItem);
        });
    });
}

// 메뉴 삭제 함수
function deleteMenu(menuId, categoryId) {
    // 카테고리 내 해당 메뉴 제거
    const categoryElement = document.getElementById(categoryId);
    if (categoryElement) {
        const menuCard = categoryElement.querySelector(`[data-id="${menuId}"]`);
        if (menuCard) {
            menuCard.remove();
        }
    }

    // 삭제 리스트에서도 해당 메뉴 제거
    const menuListContainer = document.getElementById("menuList");
    const menuItem = menuListContainer.querySelector(`[data-menu-id="${menuId}"]`);
    if (menuItem) {
        menuItem.remove();
    }

    alert("메뉴가 삭제되었습니다.");
}

// 관리자 페이지 열릴 때 삭제 가능한 메뉴 리스트 로드
document.querySelector(".manager_button").addEventListener("click", loadDeletableMenuList);

// 관리자 정산 데이터를 저장할 배열
let salesData = [];

// 결제 완료 처리
function confirmPayment() {
    const receiptModal = document.getElementById("receipt");
    const cartItemsContainer = document.querySelector(".cart-items");

    const cartItems = cartItemsContainer.querySelectorAll(".menu-card");
    let totalAmount = 0;
    let itemsList = [];

    // 장바구니 데이터 수집 및 복구 처리
    cartItems.forEach((item) => {
        const id = item.dataset.id; // 메뉴 ID
        const name = item.querySelector(".name").innerText;
        const quantity = parseInt(item.querySelector(".quantity").innerText, 10);
        const price = parseInt(item.getAttribute("data-price"), 10);

        totalAmount += price * quantity;
        itemsList.push(`${name} x${quantity}`);

        // 원래 메뉴로 복구
        const menuItem = document.querySelector(`[data-id='${id}']`);
        if (menuItem) {
            menuItem.style.display = "flex"; // 숨겨진 메뉴를 다시 표시
        }
    });

    // 판매 데이터 저장
    salesData.push({
        items: itemsList,
        total: totalAmount,
        date: new Date().toLocaleString("ko-KR"), // 날짜/시간 저장
    });

    // 결제 완료 알림
    alert("결제가 완료되었습니다!");

    // 영수증 모달 닫기
    receiptModal.style.display = "none";

    // 장바구니 초기화
    cartItemsContainer.innerHTML = `<p class="kcal">주문할 메뉴를 선택해 주세요!</p>`;

    // 총 결제 금액 초기화
    updateTotal();

    // 관리자 정산 화면 업데이트
    updateSalesReport();
}



// 관리자 정산 화면 업데이트 함수
function updateSalesReport() {
    const salesReportContainer = document.getElementById("salesReport");
    const totalSalesElement = document.getElementById("totalSales");

    // 기존 정산 리스트 초기화
    const salesList = salesReportContainer.querySelector(".sales-list");
    if (salesList) salesList.remove();

    // 새로운 정산 리스트 생성
    const newSalesList = document.createElement("div");
    newSalesList.className = "sales-list";

    let grandTotal = 0;

    salesData.forEach((sale, index) => {
        const saleDiv = document.createElement("div");
        saleDiv.className = "sale-entry";

        const saleItems = sale.items.join(", ");
        saleDiv.innerHTML = `
            <p><strong>결제 ${index + 1}:</strong> ${saleItems}</p>
            <p><strong>금액:</strong> ${sale.total.toLocaleString("ko-KR")}원</p>
            <p><strong>시간:</strong> ${sale.date}</p>
        `;

        newSalesList.appendChild(saleDiv);
        grandTotal += sale.total;
    });

    // 정산 화면에 추가
    salesReportContainer.appendChild(newSalesList);

    // 총 결제 금액 업데이트
    totalSalesElement.innerText = grandTotal.toLocaleString("ko-KR");
}

// 결제 완료 버튼 이벤트 리스너 등록
document.getElementById("confirmReceipt").addEventListener("click", confirmPayment);
