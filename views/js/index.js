import MicroModal from "micromodal";
MicroModal.init({
  onShow: (modal) => console.info(`${modal.id} is shown`),
  debugMode: true,
});

$("#new").on("click", function (_) {
  MicroModal.show("modal-login");
});
